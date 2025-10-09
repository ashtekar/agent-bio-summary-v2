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

// Initialize tool instances
const searchTools = new SearchTools();
const processingTools = new ProcessingTools();
const summaryTools = new SummaryTools();
const emailTools = new EmailTools();

/**
 * SEARCH TOOL: searchWeb
 */
export const searchWebTool = new DynamicStructuredTool({
  name: 'searchWeb',
  description: 'Search for articles using Google Custom Search API based on search settings. Returns search results with titles, URLs, snippets, and metadata.',
  schema: z.object({
    query: z.string().describe('Search query for synthetic biology articles'),
    maxResults: z.number().default(10).describe('Maximum number of search results to return'),
    dateRange: z.string().default('d7').describe('Date range for search results (e.g., d7 for last 7 days)'),
    sources: z.array(z.string()).default(['nature.com', 'science.org', 'biorxiv.org']).describe('Array of source domains to search')
  }),
  func: async (input) => {
    const searchSettings: SearchSettings = {
      query: input.query,
      maxResults: input.maxResults,
      dateRange: input.dateRange,
      sources: input.sources
    };
    
    const result = await searchTools.searchWeb(searchSettings);
    return JSON.stringify(result);
  }
});

/**
 * COMBINED TOOL: extractScoreAndStoreArticles (PREFERRED)
 */
export const extractScoreAndStoreArticlesTool = new DynamicStructuredTool({
  name: 'extractScoreAndStoreArticles',
  description: 'OPTIMIZED COMBINED TOOL: Extract article content, score for relevancy, and store in database. This is the PREFERRED tool that combines three operations (extract, score, store) into one efficient call to reduce latency and API costs. Use this instead of calling extractArticles, scoreRelevancy, and storeArticles separately.',
  schema: z.object({
    searchResults: z.array(z.object({
      id: z.string(),
      title: z.string(),
      url: z.string(),
      snippet: z.string().optional(),
      publishedDate: z.string().optional(),
      source: z.string().optional()
    })).describe('Array of search results from searchWeb to process'),
    relevancyThreshold: z.number().default(0.2).describe('Minimum relevancy score threshold (0-1 scale). Default: 0.2')
  }),
  func: async (input) => {
    const result = await searchTools.extractScoreAndStoreArticles(
      input.searchResults,
      input.relevancyThreshold
    );
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
    const result = await processingTools.scoreRelevancy(
      input.articles as any,
      input.relevancyThreshold
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

