/**
 * Test utilities and helpers for Agent Bio Summary V2
 */

// This file contains test utilities - no actual tests
// Tests are in the individual test files that import these utilities

import { SearchSettings, SystemSettings, EmailRecipient, AgentContext } from '@/types/agent';

// Mock data factories
export const createMockSearchSettings = (overrides?: Partial<SearchSettings>): SearchSettings => ({
  query: 'synthetic biology biotechnology',
  maxResults: 10,
  dateRange: 'd7',
  sources: ['nature.com', 'science.org', 'biorxiv.org'],
  ...overrides,
});

export const createMockSystemSettings = (overrides?: Partial<SystemSettings>): SystemSettings => ({
  summaryLength: 100,
  targetAudience: 'college sophomore',
  includeCitations: true,
  emailTemplate: 'default',
  llmModel: 'gpt-4o',
  llmTemperature: 0.3,
  llmMaxTokens: 1000,
  ...overrides,
});

export const createMockEmailRecipient = (overrides?: Partial<EmailRecipient>): EmailRecipient => ({
  email: 'test@example.com',
  name: 'Test User',
  preferences: {
    frequency: 'daily',
    format: 'html',
  },
  ...overrides,
});

export const createMockAgentContext = (overrides?: Partial<AgentContext>): AgentContext => ({
  searchSettings: createMockSearchSettings(),
  systemSettings: createMockSystemSettings(),
  recipients: [createMockEmailRecipient()],
  sessionId: 'test-session-123',
  executionId: 'test-execution-456',
  retryCount: 0,
  lastSuccessfulStep: '',
  ...overrides,
});

// Mock API responses
export const createMockOpenAIResponse = (toolCalls?: any[]) => ({
  choices: [
    {
      message: {
        tool_calls: toolCalls || [
          {
            id: 'call_123',
            type: 'function',
            function: {
              name: 'searchWeb',
              arguments: JSON.stringify({ query: 'test query' }),
            },
          },
        ],
        content: null,
      },
    },
  ],
});

export const createMockToolResult = (success = true, data?: any) => ({
  success,
  data: data || { message: 'Mock tool result' },
  error: success ? undefined : 'Mock error',
});

// Mock external service responses
export const createMockSearchResults = () => [
  {
    title: 'Test Article 1',
    url: 'https://example.com/article1',
    snippet: 'This is a test article about synthetic biology.',
    publishedDate: '2024-01-01',
  },
  {
    title: 'Test Article 2',
    url: 'https://example.com/article2',
    snippet: 'Another test article about biotechnology.',
    publishedDate: '2024-01-02',
  },
];

export const createMockArticle = (overrides?: any) => ({
  id: 'test-article-123',
  title: 'Test Article',
  url: 'https://example.com/test-article',
  content: 'This is the full content of the test article...',
  publishedDate: '2024-01-01T00:00:00Z',
  source: 'example.com',
  relevancyScore: 0.85,
  ...overrides,
});

export const createMockSummary = () => ({
  summary: 'This is a test summary of the articles.',
  html: '<p>This is a test summary of the articles.</p>',
  articlesCount: 2,
  executionTime: 30000,
});

// Test environment setup
export const setupTestEnvironment = () => {
  // Mock environment variables
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
  process.env.OPENAI_API_KEY = 'test-openai-key';
  process.env.RESEND_API_KEY = 'test-resend-key';
  process.env.GOOGLE_CUSTOM_SEARCH_API_KEY = 'test-google-key';
  process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID = 'test-engine-id';
  process.env.LANGCHAIN_API_KEY = 'test-langchain-key';
  process.env.LANGCHAIN_TRACING_V2 = 'true';
  process.env.LANGCHAIN_PROJECT = 'test-project';
  process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
};

// Async test helpers
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const createAsyncMock = <T>(value: T, delay = 0) => {
  return jest.fn().mockImplementation(() => 
    delay > 0 ? waitFor(delay).then(() => value) : Promise.resolve(value)
  );
};

// Error simulation helpers
export const createMockError = (message = 'Mock error') => new Error(message);

export const createMockRejection = (message = 'Mock rejection') => 
  Promise.reject(new Error(message));

// Assertion helpers
export const expectToBeValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  expect(uuid).toMatch(uuidRegex);
};

export const expectToBeValidTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  expect(date).toBeInstanceOf(Date);
  expect(date.getTime()).not.toBeNaN();
};

// Cleanup helpers
export const cleanupMocks = () => {
  jest.clearAllMocks();
  jest.resetAllMocks();
};

export const restoreEnvironment = (originalEnv: NodeJS.ProcessEnv) => {
  Object.keys(process.env).forEach(key => {
    if (!(key in originalEnv)) {
      delete process.env[key];
    }
  });
  Object.assign(process.env, originalEnv);
};
