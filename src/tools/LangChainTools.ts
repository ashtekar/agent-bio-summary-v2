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
  modelName: 'ft:gpt-4.1-nano-2025-04-14:personal::CFRUvxM1',  // Fine-tuned model for individual summaries
  temperature: 0.3,
  maxTokens: 500
});
const emailTools = new EmailTools();

// Session ID and User ID for the current execution (will be set by agent)
let currentSessionId: string | null = null;
let currentUserId: string | null = null;

export function setToolSessionId(sessionId: string, userId?: string) {
  console.log(`[SESSION] Set: ${currentSessionId} -> ${sessionId} (userId: ${userId || 'none'})`);
  currentSessionId = sessionId;
  if (userId) {
    currentUserId = userId;
  }
}

export function getToolSessionId(): string {
  if (!currentSessionId) {
    currentSessionId = `session_${Date.now()}`;
    console.log(`[SESSION] Created: ${currentSessionId}`);
  }
  return currentSessionId;
}

export function getToolUserId(): string {
  if (!currentUserId) {
    console.warn('[SESSION] No userId set, using "unknown"');
    return 'unknown';
  }
  return currentUserId;
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
    const userId = getToolUserId();
    console.log(`[SEARCH-WEB] Session: ${sessionId}, User: ${userId}`);
    
    const searchSettings: SearchSettings = {
      query: input.query,
      maxResults: input.maxResults,
      dateRange: input.dateRange,
      sources: input.sources
    };
    
    const result = await searchTools.searchWeb(searchSettings);
    
    if (result.success && result.data) {
      toolStateManager.updateState(sessionId, userId, { 
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
  description: 'Extract article content, score for relevancy, and store in database. Automatically reads search results and user preferences from tool state. No parameters needed. Call searchWeb first to populate search results.',
  schema: z.object({}),  // No parameters - tool is self-sufficient
  func: async () => {
    const sessionId = getToolSessionId();
    const userId = getToolUserId();
    console.log(`[EXTRACT-SCORE-STORE] Session: ${sessionId}, User: ${userId}`);
    
    // Read search results from state
    const state = toolStateManager.getState(sessionId, userId);
    
    // Tool pulls relevancy threshold from context (user preferences)
    const relevancyThreshold = state.context?.systemSettings?.relevancyThreshold ?? 0.2;
    const maxArticles = state.context?.systemSettings?.maxArticlesToSummarize ?? 10;
    console.log(`[EXTRACT-SCORE-STORE] Using relevancy threshold from context: ${relevancyThreshold}`);
    console.log(`[EXTRACT-SCORE-STORE] Using max articles limit from context: ${maxArticles}`);
    
    if (!state.searchResults || state.searchResults.length === 0) {
      console.log(`[EXTRACT-SCORE-STORE] No results in session ${sessionId}, searching all sessions...`);
      
      // Try to find search results in any available session for this user
      // Note: This searches across all sessions, but state is isolated per user via userId
      const allSessions = toolStateManager.getSessions();
      
      for (const sessionWithData of allSessions) {
        // Extract sessionId from key format "userId:sessionId"
        const sessionIdMatch = sessionWithData.match(/^[^:]+:(.+)$/);
        if (!sessionIdMatch) continue;
        const extractedSessionId = sessionIdMatch[1];
        const sessionState = toolStateManager.getState(extractedSessionId, userId);
        
        if (sessionState.searchResults && sessionState.searchResults.length > 0) {
          console.log(`[EXTRACT-SCORE-STORE] Found ${sessionState.searchResults.length} results in session ${sessionWithData}`);
          console.log(`[EXTRACT-SCORE-STORE] Updating session: ${sessionId} -> ${sessionWithData}`);
          
          // Update the current session to point to the one with data
          setToolSessionId(extractedSessionId, userId);
          
          // Use threshold from this session's context
          const sessionThreshold = sessionState.context?.systemSettings?.relevancyThreshold ?? 0.2;
          const sessionMaxArticles = sessionState.context?.systemSettings?.maxArticlesToSummarize ?? 10;
          console.log(`[EXTRACT-SCORE-STORE] Using relevancy threshold from found session: ${sessionThreshold}`);
          console.log(`[EXTRACT-SCORE-STORE] Using max articles limit from found session: ${sessionMaxArticles}`);
          
          const result = await searchTools.extractScoreAndStoreArticles(
            sessionState.searchResults,
            sessionThreshold,
            {
              query: sessionState.metadata?.query || '',
              maxResults: sessionState.searchResults.length,
              sources: [],
              dateRange: 'd7'
            },
            sessionMaxArticles
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
      relevancyThreshold,
      searchSettings,
      maxArticles
    );
    
    // Store processed articles in state
    if (result.success && result.data) {
      toolStateManager.updateState(sessionId, userId, {
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
    const userId = getToolUserId();
    const state = toolStateManager.getState(sessionId, userId);
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
  description: 'Generate comprehensive summaries for ALL stored articles. Reads from state (populated by extractScoreAndStoreArticles). Automatically processes all articles in batches of 2 to avoid JSON limits. Returns all summaries at once. IMPORTANT: Call extractScoreAndStoreArticles first.',
  schema: z.object({
    // No parameters needed - automatically processes all articles
  }),
  func: async (input) => {
    const sessionId = getToolSessionId();
    const userId = getToolUserId();
    const state = toolStateManager.getState(sessionId, userId);
    
    // Read stored articles from state
    const storedArticles = state.storedArticles || state.extractedArticles || state.scoredArticles;
    
    if (!storedArticles || storedArticles.length === 0) {
      return JSON.stringify({
        success: false,
        error: 'No articles found in state. Call extractScoreAndStoreArticles first.'
      });
    }
    
    console.log(`[SUMMARIZE-ALL] Processing ${storedArticles.length} articles automatically`);
    
    // Process all articles in batches of 2 internally
    const batchSize = 2;
    const allSummaries = [];
    
    for (let startIndex = 0; startIndex < storedArticles.length; startIndex += batchSize) {
      const endIndex = Math.min(startIndex + batchSize, storedArticles.length);
      const batchArticles = storedArticles.slice(startIndex, endIndex);
      
      console.log(`[SUMMARIZE-ALL] Processing batch ${Math.floor(startIndex / batchSize) + 1}: articles ${startIndex + 1}-${endIndex}`);
      
      // Truncate content for safety
      const truncatedArticles = batchArticles.map(article => ({
        ...article,
        content: article.content?.substring(0, 2500) || ''
      }));
      
      const batchResult = await summaryTools.summarizeArticle(truncatedArticles as any);
      
      if (batchResult.success && batchResult.data) {
        allSummaries.push(...batchResult.data);
      } else {
        console.warn(`[SUMMARIZE-ALL] Batch ${Math.floor(startIndex / batchSize) + 1} failed:`, batchResult.error);
      }
    }
    
    // Store all summaries in state for collateSummary
    if (allSummaries.length > 0) {
      toolStateManager.updateState(sessionId, userId, {
        summaries: allSummaries
      });
    }
    
    return JSON.stringify({
      success: true,
      data: allSummaries,
      metadata: {
        totalArticles: storedArticles.length,
        summariesGenerated: allSummaries.length,
        batchesProcessed: Math.ceil(storedArticles.length / batchSize)
      }
    });
  }
});

/**
 * COLLATION TOOL: collateSummary
 */
export const collateSummaryTool = new DynamicStructuredTool({
  name: 'collateSummary',
  description: 'Combine individual article summaries into a single HTML email newsletter format using deterministic template. Preserves summaries verbatim without modification. Reads summaries from state (populated by summarizeArticle). IMPORTANT: Call summarizeArticle first to generate summaries.',
  schema: z.object({
    // No parameters needed - reads all summaries from state
  }),
  func: async (input) => {
    const sessionId = getToolSessionId();
    const userId = getToolUserId();
    const state = toolStateManager.getState(sessionId, userId);
    
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
      toolStateManager.updateState(sessionId, userId, {
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
  description: 'Send the final collated summary via email to recipients using Resend.io. Recipients are auto-injected from context if not provided.',
  schema: z.object({
    summary: z.string().describe('The collated HTML summary to send'),
    recipients: z.array(z.object({
      email: z.string().email(),
      name: z.string(),
      preferences: z.object({
        frequency: z.string(),
        format: z.string()
      }).optional()
    })).optional().describe('Array of email recipients (optional - will use context recipients if not provided)'),
    metadata: z.object({
      sessionId: z.string(),
      articlesCount: z.number().optional(),
      executionTime: z.number().optional()
    }).optional().describe('Execution metadata for tracking')
  }),
  func: async (input) => {
    const sessionId = getToolSessionId();
    const userId = getToolUserId();
    console.log('🔍 [SEND-EMAIL-TOOL] Session ID:', sessionId);
    console.log('🔍 [SEND-EMAIL-TOOL] Input recipients received:', JSON.stringify(input.recipients || [], null, 2));
    
    // ALWAYS USE CONTEXT RECIPIENTS (ignore GPT-5.1's hallucinated recipients)
    const state = toolStateManager.getState(sessionId, userId);
    console.log('🔍 [SEND-EMAIL-TOOL] ToolState context:', JSON.stringify(state.context, null, 2));
    
    let recipients: EmailRecipient[] = [];
    
    if (state.context?.recipients) {
      recipients = state.context.recipients;
      console.log('✅ [SEND-EMAIL-TOOL] Using context recipients (ignoring GPT-5.1 input):', recipients.length);
      console.log('✅ [SEND-EMAIL-TOOL] Context recipients:', JSON.stringify(recipients, null, 2));
      
      // Log what GPT-5.1 tried to pass (for debugging)
      if (input.recipients && input.recipients.length > 0) {
        console.log('⚠️ [SEND-EMAIL-TOOL] GPT-5.1 tried to use fake recipients:', JSON.stringify(input.recipients, null, 2));
        console.log('⚠️ [SEND-EMAIL-TOOL] Ignoring GPT-5.1 recipients in favor of context recipients');
      }
    } else {
      console.error('❌ [SEND-EMAIL-TOOL] No recipients in context!');
      console.error('❌ [SEND-EMAIL-TOOL] Available state keys:', Object.keys(state));
      
      // Fallback to GPT-5.1's recipients if context is missing
      if (input.recipients && input.recipients.length > 0) {
        recipients = input.recipients.map(r => ({
          email: r.email,
          name: r.name,
          preferences: r.preferences || { frequency: 'daily', format: 'html' }
        }));
        console.log('⚠️ [SEND-EMAIL-TOOL] Fallback: Using GPT-5.1 recipients due to missing context');
      }
    }
    
    console.log('🔍 [SEND-EMAIL-TOOL] Final recipients count:', recipients.length);
    
    const result = await emailTools.sendEmail({
      summary: input.summary,
      recipients,
      metadata: {
        sessionId,
        articlesCount: input.metadata?.articlesCount ?? 0,
        executionTime: input.metadata?.executionTime ?? 0
      }
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

