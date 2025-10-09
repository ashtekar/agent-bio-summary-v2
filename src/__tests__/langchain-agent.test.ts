/**
 * Test LangChain Agent
 * Week 3: Verify new agent works correctly
 */

import { LangChainBioSummaryAgent } from '@/agents/LangChainBioSummaryAgent';
import { SearchSettings, SystemSettings, EmailRecipient } from '@/types/agent';

describe('LangChainBioSummaryAgent', () => {
  const testContext = {
    searchSettings: {
      query: 'synthetic biology CRISPR',
      maxResults: 2,
      dateRange: 'd7',
      sources: ['nature.com']
    } as SearchSettings,
    
    systemSettings: {
      summaryLength: 100,
      targetAudience: 'college sophomore',
      includeCitations: true,
      emailTemplate: 'default',
      llmModel: 'gpt-4o',
      llmTemperature: 0.3,
      llmMaxTokens: 1000
    } as SystemSettings,
    
    recipients: [
      {
        email: 'test@example.com',
        name: 'Test User',
        preferences: {
          frequency: 'daily',
          format: 'html'
        }
      }
    ] as EmailRecipient[]
  };

  it('should initialize without errors', () => {
    expect(() => new LangChainBioSummaryAgent(testContext)).not.toThrow();
  });

  it('should have correct model configuration', () => {
    const agent = new LangChainBioSummaryAgent(testContext);
    const context = agent.getContext();
    
    expect(context.systemSettings.llmModel).toBe('gpt-4o');
    expect(context.systemSettings.llmTemperature).toBe(0.3);
    expect(context.systemSettings.llmMaxTokens).toBe(1000);
  });

  it('should generate session ID', () => {
    const agent = new LangChainBioSummaryAgent(testContext);
    const context = agent.getContext();
    
    expect(context.sessionId).toBeDefined();
    expect(context.sessionId).toContain('langchain_session_');
  });
});

