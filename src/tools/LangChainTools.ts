/**
 * LangChain Tool Definitions
 * Converts OpenAI function definitions to LangChain DynamicStructuredTool format
 * Week 3: Agent Migration
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { SearchTools } from './SearchTools';
import { ProcessingTools } from './ProcessingTools';
import { SummaryTools } from './SummaryTools';
import { EmailTools } from './EmailTools';
import { SearchSettings, EmailRecipient } from '@/types/agent';
import { toolStateManager } from './ToolState';

// Initialize tool instances
const searchTools = new SearchTools();
const processingTools = new ProcessingTools();
const summaryTools = new SummaryTools();
const emailTools = new EmailTools();

// Session ID for the current execution (will be set by agent)
let currentSessionId: string | null = null;

export function setToolSessionId(sessionId: string) {
  console.log(`[SESSION] Setting session ID: ${sessionId} (previous: ${currentSessionId})`);
  currentSessionId = sessionId;
}

export function getToolSessionId(): string {
  if (!currentSessionId) {
    // Fallback for legacy usage
    currentSessionId = `session_${Date.now()}`;
    console.log(`[SESSION] Created new session ID: ${currentSessionId}`);
  } else {
    console.log(`[SESSION] Using existing session ID: ${currentSessionId}`);
  }
  return currentSessionId;
}

/**
 * SEARCH TOOL: searchWeb
 * Stores results in shared state to avoid token limits when passing to next tool
 */
export const searchWebTool = new DynamicStructuredTool({
  name: 'searchWeb',
  description: 'Search for articles using Google Custom Search API. Results are automatically stored in state for the next tool. Returns a summary of found articles.',
  schema: z.object({
    query: z.string().describe('Search query for synthetic biology articles'),
    maxResults: z.number().default(10).describe('Maximum number of search results to return (max: 100)'),
    dateRange: z.string().default('d7').describe('Date range for search results (e.g., d7 for last 7 days)'),
    sources: z.array(z.string()).default(['nature.com', 'science.org', 'biorxiv.org']).describe('Array of source domains to search')
  }),
  func: async (input) => {
    console.log(`[SEARCH-WEB] Starting search with input:`, JSON.stringify(input, null, 2));
    
    const searchSettings: SearchSettings = {
      query: input.query,
      maxResults: input.maxResults,
      dateRange: input.dateRange,
      sources: input.sources
    };
    
    console.log(`[SEARCH-WEB] Calling searchTools.searchWeb with settings:`, JSON.stringify(searchSettings, null, 2));
    const result = await searchTools.searchWeb(searchSettings);
    console.log(`[SEARCH-WEB] Search result:`, JSON.stringify(result, null, 2));
    
    if (result.success && result.data) {
      // Store search results in state for next tool
      const sessionId = getToolSessionId();
      console.log(`[SEARCH-WEB] Session ID: ${sessionId}`);
      console.log(`[SEARCH-WEB] Storing ${result.data.length} search results in state`);
      
      toolStateManager.updateState(sessionId, { 
        searchResults: result.data,
        metadata: {
          query: input.query,
          totalResults: result.data.length,
          timestamp: new Date().toISOString()
        }
      });
      
      console.log(`[SEARCH-WEB] State updated successfully`);
      
      // Return summary instead of full results
      return JSON.stringify({
        success: true,
        message: `Found ${result.data.length} articles. Results stored in state. Use extractScoreAndStoreArticles to process them.`,
        count: result.data.length,
        preview: result.data.slice(0, 3).map((r: any) => ({ title: r.title, url: r.url }))
      });
    }
    
    return JSON.stringify(result);
  }
});

/**
 * COMBINED TOOL: extractScoreAndStoreArticles (PREFERRED)
 * Reads search results from shared state to avoid JSON payload size issues
 */
export const extractScoreAndStoreArticlesTool = new DynamicStructuredTool({
  name: 'extractScoreAndStoreArticles',
  description: 'OPTIMIZED COMBINED TOOL: Extract article content, score for relevancy, and store in database. Automatically reads search results from state (populated by searchWeb). Combines three operations (extract, score, store) into one efficient call. IMPORTANT: You MUST call searchWeb first to populate the state with search results before calling this tool.',
  schema: z.object({
    relevancyThreshold: z.number().default(0.2).describe('Minimum relevancy score threshold (0-1 scale). Default: 0.2')
  }),
  func: async (input) => {
    console.log(`[EXTRACT-SCORE-STORE] Called with input:`, JSON.stringify(input, null, 2));
    console.log(`[EXTRACT-SCORE-STORE] Tool called at: ${new Date().toISOString()}`);
    
    // Check if this is the first tool call in this execution
    const allSessions = toolStateManager.getSessions();
    console.log(`[EXTRACT-SCORE-STORE] Total sessions in state manager: ${allSessions.length}`);
    
    // Read search results from state
    const sessionId = getToolSessionId();
    const state = toolStateManager.getState(sessionId);
    
    console.log(`[EXTRACT-SCORE-STORE] Session ID: ${sessionId}`);
    console.log(`[EXTRACT-SCORE-STORE] State:`, JSON.stringify(state, null, 2));
    console.log(`[EXTRACT-SCORE-STORE] All available sessions:`, toolStateManager.getSessions());
    
    // Check if searchWeb was ever called by looking for any session with search results
    const allSessions = toolStateManager.getSessions();
    let foundSearchResults = false;
    for (const sessionId of allSessions) {
      const sessionState = toolStateManager.getState(sessionId);
      if (sessionState.searchResults && sessionState.searchResults.length > 0) {
        foundSearchResults = true;
        console.log(`[EXTRACT-SCORE-STORE] Found search results in session ${sessionId}: ${sessionState.searchResults.length} results`);
        break;
      }
    }
    
    if (!foundSearchResults) {
      console.error(`[EXTRACT-SCORE-STORE] CRITICAL: No searchWeb results found in ANY session!`);
      console.error(`[EXTRACT-SCORE-STORE] This means searchWeb was never called or failed to store results.`);
      console.error(`[EXTRACT-SCORE-STORE] Available sessions:`, allSessions);
      for (const sessionId of allSessions) {
        const sessionState = toolStateManager.getState(sessionId);
        console.error(`[EXTRACT-SCORE-STORE] Session ${sessionId} state:`, JSON.stringify(sessionState, null, 2));
      }
    } else {
      console.log(`[EXTRACT-SCORE-STORE] Found search results in other sessions, but current session ${sessionId} is empty`);
      console.log(`[EXTRACT-SCORE-STORE] This indicates a session ID mismatch between searchWeb and extractScoreAndStoreArticles`);
    }
    
    if (!state.searchResults || state.searchResults.length === 0) {
      console.error(`[EXTRACT-SCORE-STORE] No search results found. State keys:`, Object.keys(state || {}));
      console.error(`[EXTRACT-SCORE-STORE] Available sessions:`, toolStateManager.getSessions());
      
      // Try to find search results in any available session
      const allSessions = toolStateManager.getSessions();
      console.log(`[EXTRACT-SCORE-STORE] Searching ${allSessions.length} sessions for search results...`);
      
      for (const sessionWithData of allSessions) {
        const sessionState = toolStateManager.getState(sessionWithData);
        console.log(`[EXTRACT-SCORE-STORE] Checking session ${sessionWithData}:`, {
          hasSearchResults: !!sessionState.searchResults,
          searchResultsCount: sessionState.searchResults?.length || 0,
          hasMetadata: !!sessionState.metadata
        });
        
        if (sessionState.searchResults && sessionState.searchResults.length > 0) {
          console.log(`[EXTRACT-SCORE-STORE] ✅ Found search results in session ${sessionWithData}, using those instead`);
          console.log(`[EXTRACT-SCORE-STORE] Current session: ${sessionId}, Using session: ${sessionWithData}`);
          
          // Update the current session to point to the one with data
          setToolSessionId(sessionWithData);
          
          const result = await searchTools.extractScoreAndStoreArticles(
            sessionState.searchResults,
            input.relevancyThreshold,
            {
              query: sessionState.metadata?.query || '',
              maxResults: sessionState.searchResults.length,
              sources: [],
              dateRange: 'd7'
            }
          );
          return JSON.stringify(result);
        }
      }
      
      return JSON.stringify({
        success: false,
        error: 'No search results found in state. You must call searchWeb first to search for articles before calling extractScoreAndStoreArticles. The correct workflow is: 1) searchWeb 2) extractScoreAndStoreArticles 3) summarizeArticle 4) collateSummary 5) sendEmail.'
      });
    }
    
    console.log(`Processing ${state.searchResults.length} search results from state`);
    
    // Reconstruct search settings from state metadata
    const searchSettings = {
      query: state.metadata?.query || '',
      maxResults: state.searchResults.length,
      sources: [], // Sources are not stored in metadata, but that's OK for scoring
      dateRange: 'd7' // Default to 7 days if not specified
    };
    
    console.log(`[SCORING] Using search settings: query="${searchSettings.query}"`);
    
    const result = await searchTools.extractScoreAndStoreArticles(
      state.searchResults,
      input.relevancyThreshold,
      searchSettings
    );
    
    // Store processed articles in state
    if (result.success && result.data) {
      toolStateManager.updateState(sessionId, {
        extractedArticles: result.data,
        scoredArticles: result.data,
        storedArticles: result.data
      });
    }
    
    return JSON.stringify(result);
  }
});

/**
 * LEGACY TOOL: extractArticles
 */
export const extractArticlesTool = new DynamicStructuredTool({
  name: 'extractArticles',
  description: '[LEGACY] Extract full article content from search result URLs. Note: Use extractScoreAndStoreArticles for better performance.',
  schema: z.object({
    searchResults: z.array(z.object({
      id: z.string(),
      title: z.string(),
      url: z.string(),
      snippet: z.string().optional()
    })).describe('Array of search results to extract content from')
  }),
  func: async (input) => {
    const result = await searchTools.extractArticles(input.searchResults);
    return JSON.stringify(result);
  }
});

/**
 * PROCESSING TOOL: scoreRelevancy
 */
export const scoreRelevancyTool = new DynamicStructuredTool({
  name: 'scoreRelevancy',
  description: '[LEGACY] Score articles for relevancy using algorithmic scoring. Note: Use extractScoreAndStoreArticles for better performance.',
  schema: z.object({
    articles: z.array(z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
      url: z.string().optional(),
      snippet: z.string().optional(),
      publishedDate: z.string().optional(),
      source: z.string().optional(),
      relevancyScore: z.number().optional()
    })).describe('Array of articles to score'),
    relevancyThreshold: z.number().default(0.2).describe('Minimum relevancy score threshold')
  }),
  func: async (input) => {
    // Get user keywords from state metadata
    const sessionId = getToolSessionId();
    const state = toolStateManager.getState(sessionId);
    const userKeywords = state.metadata?.query ? 
      state.metadata.query.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0) : 
      [];
    
    console.log(`[SCORING] Using user keywords: ${userKeywords.join(', ')}`);
    
    const result = await processingTools.scoreRelevancy(
      input.articles as any,
      input.relevancyThreshold,
      userKeywords
    );
    return JSON.stringify(result);
  }
});

/**
 * STORAGE TOOL: storeArticles
 */
export const storeArticlesTool = new DynamicStructuredTool({
  name: 'storeArticles',
  description: '[LEGACY] Store relevant articles in Supabase database. Note: Use extractScoreAndStoreArticles for better performance.',
  schema: z.object({
    articles: z.array(z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
      url: z.string(),
      publishedDate: z.string().optional(),
      source: z.string(),
      relevancyScore: z.number()
    })).describe('Array of scored articles to store')
  }),
  func: async (input) => {
    const result = await processingTools.storeArticles(input.articles as any);
    return JSON.stringify(result);
  }
});

/**
 * SUMMARY TOOL: summarizeArticle
 */
export const summarizeArticleTool = new DynamicStructuredTool({
  name: 'summarizeArticle',
  description: 'Generate comprehensive summaries (minimum 100 words each) for articles. Automatically evaluates quality using LLM-as-a-judge. IMPORTANT: Process MAX 2 articles per call to avoid token limits.',
  schema: z.object({
    articles: z.array(z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
      url: z.string(),
      source: z.string().optional(),
      relevancyScore: z.number().optional()
    })).max(2).describe('Array of articles to summarize (MAX 2 per call)')
  }),
  func: async (input) => {
    // Apply smart truncation before passing to summary tool
    const truncatedArticles = input.articles.map(article => ({
      ...article,
      content: article.content.substring(0, 2500) // Limit content
    }));
    
    const result = await summaryTools.summarizeArticle(truncatedArticles as any);
    return JSON.stringify(result);
  }
});

/**
 * COLLATION TOOL: collateSummary
 */
export const collateSummaryTool = new DynamicStructuredTool({
  name: 'collateSummary',
  description: 'Combine individual article summaries into a single HTML email newsletter format. Automatically evaluates final quality using LLM-as-a-judge.',
  schema: z.object({
    summaries: z.array(z.object({
      articleId: z.string(),
      summary: z.string(),
      keyPoints: z.array(z.string()).optional(),
      qualityScore: z.number(),
      evaluationResults: z.any().optional()
    })).describe('Array of article summaries to collate')
  }),
  func: async (input) => {
    const result = await summaryTools.collateSummary(input.summaries as any);
    return JSON.stringify(result);
  }
});

/**
 * EMAIL TOOL: sendEmail
 */
export const sendEmailTool = new DynamicStructuredTool({
  name: 'sendEmail',
  description: 'Send the final collated summary via email to recipients using Resend.io. MUST include all recipients from context.',
  schema: z.object({
    summary: z.string().describe('The collated HTML summary to send'),
    recipients: z.array(z.object({
      email: z.string().email(),
      name: z.string(),
      preferences: z.object({
        frequency: z.string(),
        format: z.string()
      }).optional()
    })).describe('Array of email recipients'),
    metadata: z.object({
      sessionId: z.string(),
      articlesCount: z.number(),
      executionTime: z.number()
    }).describe('Execution metadata for tracking')
  }),
  func: async (input) => {
    const recipients: EmailRecipient[] = input.recipients.map(r => ({
      email: r.email,
      name: r.name,
      preferences: r.preferences || { frequency: 'daily', format: 'html' }
    }));
    
    const result = await emailTools.sendEmail({
      summary: input.summary,
      recipients,
      metadata: input.metadata
    });
    return JSON.stringify(result);
  }
});

/**
 * Export all tools
 */
export const allLangChainTools = [
  searchWebTool,
  extractScoreAndStoreArticlesTool,
  extractArticlesTool,
  scoreRelevancyTool,
  storeArticlesTool,
  summarizeArticleTool,
  collateSummaryTool,
  sendEmailTool
];

/**
 * Helper to get tool by name
 */
export function getLangChainTool(name: string) {
  return allLangChainTools.find(tool => tool.name === name);
}

