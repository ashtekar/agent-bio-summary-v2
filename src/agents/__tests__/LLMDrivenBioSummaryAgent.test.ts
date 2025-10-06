// Mock external dependencies first
jest.mock('openai', () => {
  const mockOpenAI = jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  }));
  
  return {
    default: mockOpenAI,
    OpenAI: mockOpenAI,
  };
});

jest.mock('@/lib/langchain', () => ({
  langchainIntegration: {
    invoke: jest.fn(),
  },
}));

import { LLMDrivenBioSummaryAgent } from '../LLMDrivenBioSummaryAgent';
import { AgentContext, SearchSettings, SystemSettings, EmailRecipient } from '@/types/agent';
import { logger } from '@/lib/logger';

jest.mock('@/tools/SearchTools', () => ({
  SearchTools: jest.fn().mockImplementation(() => ({
    searchWeb: jest.fn(),
    extractArticles: jest.fn(),
    scoreRelevancy: jest.fn(),
    storeArticles: jest.fn(),
  })),
}));

jest.mock('@/tools/SummaryTools', () => ({
  SummaryTools: jest.fn().mockImplementation(() => ({
    summarizeArticle: jest.fn(),
    collateSummary: jest.fn(),
  })),
}));

jest.mock('@/tools/EmailTools', () => ({
  EmailTools: jest.fn().mockImplementation(() => ({
    sendEmail: jest.fn(),
  })),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    agentStart: jest.fn(),
    agentComplete: jest.fn(),
    agentError: jest.fn(),
    toolExecution: jest.fn(),
    llmCall: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('LLMDrivenBioSummaryAgent', () => {
  let mockContext: AgentContext;
  let agent: LLMDrivenBioSummaryAgent;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock context
    mockContext = {
      searchSettings: {
        query: 'synthetic biology biotechnology',
        maxResults: 10,
        dateRange: 'd7',
        sources: ['nature.com', 'science.org', 'biorxiv.org'],
      } as SearchSettings,
      
      systemSettings: {
        summaryLength: 100,
        targetAudience: 'college sophomore',
        includeCitations: true,
        emailTemplate: 'default',
        llmModel: 'gpt-4o',
        llmTemperature: 0.3,
        llmMaxTokens: 1000,
      } as SystemSettings,
      
      recipients: [
        {
          email: 'test@example.com',
          name: 'Test User',
          preferences: {
            frequency: 'daily',
            format: 'html',
          },
        },
      ] as EmailRecipient[],
      
      sessionId: 'test-session-123',
      executionId: 'test-execution-456',
      retryCount: 0,
      lastSuccessfulStep: '',
    };

    // Create agent instance
    agent = new LLMDrivenBioSummaryAgent(mockContext);
  });

  describe('Constructor', () => {
    it('should initialize with provided context', () => {
      expect(agent).toBeInstanceOf(LLMDrivenBioSummaryAgent);
      expect(logger.agentStart).toHaveBeenCalledWith('LLMDrivenBioSummaryAgent', 'test-session-123', mockContext);
    });

    it('should throw error if OpenAI API key is missing', () => {
      const originalApiKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      expect(() => new LLMDrivenBioSummaryAgent(mockContext)).toThrow('OPENAI_API_KEY environment variable is required');

      // Restore API key
      process.env.OPENAI_API_KEY = originalApiKey;
    });
  });

  describe('execute', () => {
    it('should execute successfully with mock LLM responses', async () => {
      // Mock successful LLM response
      const mockLLMResponse = {
        choices: [
          {
            message: {
              tool_calls: [
                {
                  id: 'call_123',
                  type: 'function',
                  function: {
                    name: 'searchWeb',
                    arguments: JSON.stringify({ query: 'synthetic biology biotechnology' }),
                  },
                },
              ],
            },
          },
        ],
      };

      // Mock OpenAI response
      const { OpenAI } = require('openai');
      const mockOpenAI = new OpenAI();
      mockOpenAI.chat.completions.create.mockResolvedValue(mockLLMResponse);

      // Mock tool execution
      const { SearchTools } = require('@/tools/SearchTools');
      const mockSearchTools = new SearchTools();
      mockSearchTools.searchWeb.mockResolvedValue({
        success: true,
        data: [{ title: 'Test Article', url: 'https://example.com' }],
      });

      // Execute agent
      const result = await agent.execute();

      expect(result.success).toBe(true);
      expect(logger.agentComplete).toHaveBeenCalledWith('LLMDrivenBioSummaryAgent', 'test-session-123', expect.any(Object));
    });

    it('should handle LLM errors gracefully', async () => {
      // Mock LLM error
      const { OpenAI } = require('openai');
      const mockOpenAI = new OpenAI();
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('OpenAI API error'));

      const result = await agent.execute();

      expect(result.success).toBe(false);
      expect(result.error).toContain('OpenAI API error');
      expect(logger.agentError).toHaveBeenCalledWith('LLMDrivenBioSummaryAgent', 'test-session-123', expect.any(Error));
    });

    it('should respect max iterations', async () => {
      // Mock LLM response that keeps calling tools
      const mockLLMResponse = {
        choices: [
          {
            message: {
              tool_calls: [
                {
                  id: 'call_123',
                  type: 'function',
                  function: {
                    name: 'searchWeb',
                    arguments: JSON.stringify({ query: 'test' }),
                  },
                },
              ],
            },
          },
        ],
      };

      const { OpenAI } = require('openai');
      const mockOpenAI = new OpenAI();
      mockOpenAI.chat.completions.create.mockResolvedValue(mockLLMResponse);

      // Mock tool to always succeed
      const { SearchTools } = require('@/tools/SearchTools');
      const mockSearchTools = new SearchTools();
      mockSearchTools.searchWeb.mockResolvedValue({
        success: true,
        data: [{ title: 'Test Article', url: 'https://example.com' }],
      });

      const result = await agent.execute();

      expect(result.success).toBe(true);
      // Should stop after max iterations (10)
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(10);
    });
  });

  describe('updateContextFromToolResult', () => {
    it('should update context for searchWeb tool result', () => {
      const toolResult = {
        success: true,
        data: [{ title: 'Test Article', url: 'https://example.com' }],
      };

      agent['updateContextFromToolResult']('searchWeb', toolResult);

      expect(agent['context'].articles).toEqual(toolResult.data);
    });

    it('should update context for extractArticles tool result', () => {
      const toolResult = {
        success: true,
        data: [{ title: 'Extracted Article', content: 'Article content...' }],
      };

      agent['updateContextFromToolResult']('extractArticles', toolResult);

      expect(agent['context'].extractedArticles).toEqual(toolResult.data);
    });

    it('should update context for collateSummary tool result', () => {
      const toolResult = {
        success: true,
        data: { summary: 'Final summary...', html: '<p>Summary HTML</p>' },
      };

      agent['updateContextFromToolResult']('collateSummary', toolResult);

      expect(agent['context'].finalSummary).toEqual(toolResult.data);
    });
  });

  describe('Error Handling', () => {
    it('should handle tool execution errors', async () => {
      // Mock LLM response
      const mockLLMResponse = {
        choices: [
          {
            message: {
              tool_calls: [
                {
                  id: 'call_123',
                  type: 'function',
                  function: {
                    name: 'searchWeb',
                    arguments: JSON.stringify({ query: 'test' }),
                  },
                },
              ],
            },
          },
        ],
      };

      const { OpenAI } = require('openai');
      const mockOpenAI = new OpenAI();
      mockOpenAI.chat.completions.create.mockResolvedValue(mockLLMResponse);

      // Mock tool to fail
      const { SearchTools } = require('@/tools/SearchTools');
      const mockSearchTools = new SearchTools();
      mockSearchTools.searchWeb.mockRejectedValue(new Error('Search API error'));

      const result = await agent.execute();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Search API error');
    });
  });

  describe('Configuration', () => {
    it('should use correct LLM model from context', async () => {
      const { OpenAI } = require('openai');
      const mockOpenAI = new OpenAI();
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Test response' } }],
      });

      await agent.execute();

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o',
          temperature: 0.3,
          max_tokens: 1000,
        })
      );
    });
  });
});

