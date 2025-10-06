import { SearchSettings, Article, ArticleSummary, EmailRecipient, ToolResult } from '@/types/agent';

/**
 * OpenAI Function Definitions for Agent Tools
 * These define the tools that the LLM can call during execution
 */

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

/**
 * Search Tools Function Definitions
 */
export const searchToolDefinitions: FunctionDefinition[] = [
  {
    name: 'searchWeb',
    description: 'Search for articles using Google Custom Search API based on search settings',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for synthetic biology articles'
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of search results to return'
        },
        dateRange: {
          type: 'string',
          description: 'Date range for search results (e.g., d7 for last 7 days)'
        },
        sources: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of source domains to search'
        }
      },
      required: ['query', 'maxResults', 'dateRange', 'sources']
    }
  },
  {
    name: 'extractArticles',
    description: 'Extract full content from search result URLs',
    parameters: {
      type: 'object',
      properties: {
        searchResults: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              url: { type: 'string' },
              snippet: { type: 'string' },
              publishedDate: { type: 'string' },
              source: { type: 'string' }
            }
          },
          description: 'Array of search results to extract content from'
        }
      },
      required: ['searchResults']
    }
  }
];

/**
 * Processing Tools Function Definitions
 */
export const processingToolDefinitions: FunctionDefinition[] = [
  {
    name: 'scoreRelevancy',
    description: 'Score articles for relevancy to synthetic biology using keyword analysis and source credibility',
    parameters: {
      type: 'object',
      properties: {
        articles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              url: { type: 'string' },
              content: { type: 'string' },
              publishedDate: { type: 'string' },
              source: { type: 'string' },
              relevancyScore: { type: 'number' }
            }
          },
          description: 'Array of articles to score for relevancy'
        }
      },
      required: ['articles']
    }
  },
  {
    name: 'storeArticles',
    description: 'Store relevant articles in Supabase database with relevancy scores above threshold',
    parameters: {
      type: 'object',
      properties: {
        articles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              url: { type: 'string' },
              content: { type: 'string' },
              publishedDate: { type: 'string' },
              source: { type: 'string' },
              relevancyScore: { type: 'number' }
            }
          },
          description: 'Array of articles to store in database (max 10)'
        }
      },
      required: ['articles']
    }
  }
];

/**
 * Summary Tools Function Definitions
 */
export const summaryToolDefinitions: FunctionDefinition[] = [
  {
    name: 'summarizeArticle',
    description: 'Generate individual summaries for articles using Langchain and OpenAI, minimum 100 words each',
    parameters: {
      type: 'object',
      properties: {
        articles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              url: { type: 'string' },
              content: { type: 'string' },
              publishedDate: { type: 'string' },
              source: { type: 'string' },
              relevancyScore: { type: 'number' }
            }
          },
          description: 'Array of articles to summarize'
        }
      },
      required: ['articles']
    }
  },
  {
    name: 'collateSummary',
    description: 'Combine individual article summaries into a single HTML email newsletter format',
    parameters: {
      type: 'object',
      properties: {
        summaries: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              articleId: { type: 'string' },
              summary: { type: 'string' },
              keyPoints: {
                type: 'array',
                items: { type: 'string' }
              },
              qualityScore: { type: 'number' },
              evaluationResults: {
                type: 'object',
                properties: {
                  coherence: { type: 'number' },
                  accuracy: { type: 'number' },
                  completeness: { type: 'number' },
                  readability: { type: 'number' },
                  overallScore: { type: 'number' },
                  feedback: { type: 'string' }
                }
              }
            }
          },
          description: 'Array of article summaries to collate into final format'
        }
      },
      required: ['summaries']
    }
  }
];

/**
 * Email Tools Function Definitions
 */
export const emailToolDefinitions: FunctionDefinition[] = [
  {
    name: 'sendEmail',
    description: 'Send the final collated summary via email to recipients using Resend.io',
    parameters: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'Final HTML summary content to send'
        },
        recipients: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              email: { type: 'string' },
              name: { type: 'string' },
              preferences: {
                type: 'object',
                properties: {
                  frequency: { type: 'string' },
                  format: { type: 'string' }
                }
              }
            }
          },
          description: 'Array of email recipients'
        },
        metadata: {
          type: 'object',
          properties: {
            sessionId: { type: 'string' },
            articlesCount: { type: 'number' },
            executionTime: { type: 'number' }
          },
          description: 'Metadata about the summary generation session'
        }
      },
      required: ['summary', 'recipients', 'metadata']
    }
  }
];

/**
 * Get all tool definitions for OpenAI function calling
 */
export function getAllToolDefinitions(): FunctionDefinition[] {
  return [
    ...searchToolDefinitions,
    ...processingToolDefinitions,
    ...summaryToolDefinitions,
    ...emailToolDefinitions
  ];
}

/**
 * Tool execution mapping
 */
export const TOOL_FUNCTION_MAP = {
  searchWeb: 'searchWeb',
  extractArticles: 'extractArticles',
  scoreRelevancy: 'scoreRelevancy',
  storeArticles: 'storeArticles',
  summarizeArticle: 'summarizeArticle',
  collateSummary: 'collateSummary',
  sendEmail: 'sendEmail'
} as const;

export type ToolFunctionName = keyof typeof TOOL_FUNCTION_MAP;

