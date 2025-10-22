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
const summaryTools = new SummaryTools({
  modelName: 'gpt-4o-mini',  // Default for LangChain agent path
  temperature: 0.3,
  maxTokens: 500
});
const emailTools = new EmailTools();

// Session ID for the current execution (will be set by agent)
let currentSessionId: string | null = null;

export function setToolSessionId(sessionId: string) {
  console.log(`[SESSION] Set: ${currentSessionId} -> ${sessionId}`);
  currentSessionId = sessionId;
}

export function getToolSessionId(): string {
  if (!currentSessionId) {
    currentSessionId = `session_${Date.now()}`;
    console.log(`[SESSION] Created: ${currentSessionId}`);
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
    const sessionId = getToolSessionId();
    console.log(`[SEARCH-WEB] Session: ${sessionId}`);
    
    const searchSettings: SearchSettings = {
      query: input.query,
      maxResults: input.maxResults,
      dateRange: input.dateRange,
      sources: input.sources
    };
    
    const result = await searchTools.searchWeb(searchSettings);
    
    if (result.success && result.data) {
      toolStateManager.updateState(sessionId, { 
        searchResults: result.data,
        metadata: {
          query: input.query,
          totalResults: result.data.length,
          timestamp: new Date().toISOString()
        }
      });
      
      console.log(`[SEARCH-WEB] Stored ${result.data.length} results in session: ${sessionId}`);
      
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
    const sessionId = getToolSessionId();
    console.log(`[EXTRACT-SCORE-STORE] Session: ${sessionId}`);
    
    // Read search results from state
    const state = toolStateManager.getState(sessionId);
    
    if (!state.searchResults || state.searchResults.length === 0) {
      console.log(`[EXTRACT-SCORE-STORE] No results in session ${sessionId}, searching all sessions...`);
      
      // Try to find search results in any available session
      const allSessions = toolStateManager.getSessions();
      
      for (const sessionWithData of allSessions) {
        const sessionState = toolStateManager.getState(sessionWithData);
        
        if (sessionState.searchResults && sessionState.searchResults.length > 0) {
          console.log(`[EXTRACT-SCORE-STORE] Found ${sessionState.searchResults.length} results in session ${sessionWithData}`);
          console.log(`[EXTRACT-SCORE-STORE] Updating session: ${sessionId} -> ${sessionWithData}`);
          
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
      
      console.error(`[EXTRACT-SCORE-STORE] CRITICAL: No searchWeb results found in ANY session!`);
      return JSON.stringify({
        success: false,
        error: 'No search results found in state. Call searchWeb first.'
      });
    }
    
    console.log(`[EXTRACT-SCORE-STORE] Processing ${state.searchResults.length} results from session: ${sessionId}`);
    
    // Reconstruct search settings from state metadata
    const searchSettings = {
      query: state.metadata?.query || '',
      maxResults: state.searchResults.length,
      sources: [],
      dateRange: 'd7'
    };
    
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
  description: 'Generate comprehensive summaries for stored articles. Reads from state (populated by extractScoreAndStoreArticles). Processes articles in batches (max 2 per call). Use startIndex to specify which articles to process. Returns batchInfo showing progress. IMPORTANT: Call extractScoreAndStoreArticles first.',
  schema: z.object({
    batchSize: z.number().default(2).describe('Number of articles to process in this batch (max: 2 per call for quality)'),
    startIndex: z.number().default(0).describe('Starting index in stored articles array (for batching)')
  }),
  func: async (input) => {
    const sessionId = getToolSessionId();
    const state = toolStateManager.getState(sessionId);
    
    // Read stored articles from state
    const storedArticles = state.storedArticles || state.extractedArticles || state.scoredArticles;
    
    if (!storedArticles || storedArticles.length === 0) {
      return JSON.stringify({
        success: false,
        error: 'No articles found in state. Call extractScoreAndStoreArticles first.'
      });
    }
    
    // Calculate batch based on startIndex and batchSize (max 2)
    const batchSize = Math.min(input.batchSize || 2, 2);
    const startIndex = input.startIndex || 0;
    const endIndex = startIndex + batchSize;
    
    // Get articles for this batch
    const articlesToSummarize = storedArticles.slice(startIndex, endIndex);
    
    if (articlesToSummarize.length === 0) {
      return JSON.stringify({
        success: true,
        message: `No more articles to process (startIndex ${startIndex} exceeds available articles)`,
        data: [],
        totalArticles: storedArticles.length,
        processedCount: 0
      });
    }
    
    // Truncate content for safety
    const truncatedArticles = articlesToSummarize.map(article => ({
      ...article,
      content: article.content?.substring(0, 2500) || ''
    }));
    
    const result = await summaryTools.summarizeArticle(truncatedArticles as any);
    
    // Store summaries in state for collateSummary (append to existing)
    if (result.success && result.data) {
      // Read fresh state to avoid race condition
      const currentState = toolStateManager.getState(sessionId);
      toolStateManager.updateState(sessionId, {
        summaries: [...(currentState.summaries || []), ...result.data]
      });
    }
    
    return JSON.stringify({
      ...result,
      batchInfo: {
        processedCount: articlesToSummarize.length,
        startIndex,
        endIndex,
        totalArticles: storedArticles.length,
        remainingArticles: Math.max(0, storedArticles.length - endIndex),
        allArticlesProcessed: endIndex >= storedArticles.length  // NEW: Clear completion signal
      }
    });
  }
});

/**
 * COLLATION TOOL: collateSummary
 */
export const collateSummaryTool = new DynamicStructuredTool({
  name: 'collateSummary',
  description: 'Combine individual article summaries into a single HTML email newsletter format. Reads summaries from state (populated by summarizeArticle). Automatically evaluates final quality using LLM-as-a-judge. IMPORTANT: Call summarizeArticle first to generate summaries.',
  schema: z.object({
    // No parameters needed - reads all summaries from state
  }),
  func: async (input) => {
    const sessionId = getToolSessionId();
    const state = toolStateManager.getState(sessionId);
    
    // Read summaries from state
    const summaries = state.summaries;
    
    if (!summaries || summaries.length === 0) {
      return JSON.stringify({
        success: false,
        error: 'No summaries found in state. Call summarizeArticle first to generate summaries.'
      });
    }
    
    console.log(`[COLLATE-SUMMARY] Collating ${summaries.length} summaries from state`);
    
    const result = await summaryTools.collateSummary(summaries as any);
    
    // Store collated summary in state for sendEmail
    if (result.success && result.data) {
      toolStateManager.updateState(sessionId, {
        collatedSummary: result.data
      });
    }
    
    return JSON.stringify({
      ...result,
      summaryCount: summaries.length
    });
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

