// Mock dependencies first
jest.mock('@/agents/LLMDrivenBioSummaryAgent', () => ({
  LLMDrivenBioSummaryAgent: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({
      success: true,
      data: { summary: 'Mock summary' },
    }),
  })),
}));

jest.mock('@/services/SettingsService', () => ({
  settingsService: {
    getAllSettings: jest.fn(),
  },
}));

import { NextRequest } from 'next/server';
import { POST, GET } from '../daily-summary/route';
import { settingsService } from '@/services/SettingsService';

describe('/api/daily-summary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return API information', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: 'Agent Bio Summary V2 API - LLM-Driven',
        endpoints: {
          'POST /api/daily-summary': 'Generate daily summary using LLM-driven agent with tool calling',
          'GET /api/daily-summary': 'API information'
        },
        status: 'operational',
        agentType: 'LLM-driven with OpenAI function calling'
      });
    });
  });

  describe('POST', () => {
    it('should generate summary with Supabase settings', async () => {
      const mockSettings = {
        systemSettings: {
          summaryLength: 100,
          targetAudience: 'college sophomore',
          includeCitations: true,
          emailTemplate: 'default',
          llmModel: 'gpt-4o',
          llmTemperature: 0.3,
          llmMaxTokens: 1000,
        },
        searchSettings: {
          query: 'synthetic biology biotechnology',
          maxResults: 10,
          dateRange: 'd7',
          sources: ['nature.com', 'science.org', 'biorxiv.org'],
        },
        recipients: [
          {
            email: 'test@example.com',
            name: 'Test User',
            preferences: {
              frequency: 'daily',
              format: 'html',
            },
          },
        ],
      };

      const mockAgentResult = {
        success: true,
        summary: 'Test summary',
        articlesProcessed: 5,
        executionTime: 30000,
      };

      // Mock settings service
      (settingsService.getAllSettings as jest.Mock).mockResolvedValue(mockSettings);

      // Mock agent execution - override the default mock for this test
      const { LLMDrivenBioSummaryAgent } = require('@/agents/LLMDrivenBioSummaryAgent');
      LLMDrivenBioSummaryAgent.mockImplementation(() => ({
        execute: jest.fn().mockResolvedValue(mockAgentResult),
      }));
      const mockAgent = new LLMDrivenBioSummaryAgent({});

      const request = new NextRequest('http://localhost:3000/api/daily-summary', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: mockAgentResult,
        message: 'Daily summary generated successfully',
      });

      expect(settingsService.getAllSettings).toHaveBeenCalled();
      expect(LLMDrivenBioSummaryAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          systemSettings: mockSettings.systemSettings,
          searchSettings: mockSettings.searchSettings,
          recipients: mockSettings.recipients,
          test: 'data', // Request body should be merged
        })
      );
    });

    it('should fallback to default settings when Supabase fails', async () => {
      const mockAgentResult = {
        success: true,
        summary: 'Test summary with defaults',
        articlesProcessed: 3,
        executionTime: 25000,
      };

      // Mock settings service to fail
      (settingsService.getAllSettings as jest.Mock).mockRejectedValue(
        new Error('Supabase connection failed')
      );

      // Mock agent execution - override the default mock for this test
      const { LLMDrivenBioSummaryAgent } = require('@/agents/LLMDrivenBioSummaryAgent');
      LLMDrivenBioSummaryAgent.mockImplementation(() => ({
        execute: jest.fn().mockResolvedValue(mockAgentResult),
      }));
      const mockAgent = new LLMDrivenBioSummaryAgent({});

      const request = new NextRequest('http://localhost:3000/api/daily-summary', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: mockAgentResult,
        message: 'Daily summary generated successfully',
      });

      expect(settingsService.getAllSettings).toHaveBeenCalled();
      expect(LLMDrivenBioSummaryAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          systemSettings: expect.objectContaining({
            llmModel: 'gpt-4o',
            llmTemperature: 0.3,
            llmMaxTokens: 1000,
          }),
          searchSettings: expect.objectContaining({
            query: 'synthetic biology biotechnology',
            sources: ['nature.com', 'science.org', 'biorxiv.org'],
          }),
        })
      );
    });

    it('should handle agent execution errors', async () => {
      const mockSettings = {
        systemSettings: {
          summaryLength: 100,
          targetAudience: 'college sophomore',
          includeCitations: true,
          emailTemplate: 'default',
          llmModel: 'gpt-4o',
          llmTemperature: 0.3,
          llmMaxTokens: 1000,
        },
        searchSettings: {
          query: 'synthetic biology biotechnology',
          maxResults: 10,
          dateRange: 'd7',
          sources: ['nature.com', 'science.org', 'biorxiv.org'],
        },
        recipients: [],
      };

      // Mock settings service
      (settingsService.getAllSettings as jest.Mock).mockResolvedValue(mockSettings);

      // Mock agent to fail
      const { LLMDrivenBioSummaryAgent } = require('@/agents/LLMDrivenBioSummaryAgent');
      const mockAgent = new LLMDrivenBioSummaryAgent();
      mockAgent.execute.mockResolvedValue({
        success: false,
        error: 'Agent execution failed',
      });

      const request = new NextRequest('http://localhost:3000/api/daily-summary', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Agent execution failed',
        message: 'Daily summary generation failed',
      });
    });

    it('should handle invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/daily-summary', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: expect.stringContaining('JSON'),
        message: 'Internal server error',
      });
    });

    it('should handle unexpected errors', async () => {
      // Mock settings service to throw unexpected error
      (settingsService.getAllSettings as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/daily-summary', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Unexpected error',
        message: 'Internal server error',
      });
    });
  });
});

