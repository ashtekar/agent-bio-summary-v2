// Mock Supabase before importing SettingsService
jest.mock('@supabase/supabase-js', () => {
  const mockSupabaseClient = {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(),
        eq: jest.fn(() => ({
          data: [],
          error: null,
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(),
        })),
      })),
    })),
  };
  
  return {
    createClient: jest.fn(() => mockSupabaseClient),
  };
});

import { SettingsService } from '../SettingsService';
import { SystemSettings, SearchSettings, EmailRecipient } from '@/types/agent';

describe('SettingsService', () => {
  let settingsService: SettingsService;
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    settingsService = new SettingsService();
    // Get reference to the mocked client
    const { createClient } = require('@supabase/supabase-js');
    mockSupabaseClient = createClient();
    
    // Setup default mock returns
    mockSupabaseClient.from().select().single.mockResolvedValue({
      data: null,
      error: null,
    });
    mockSupabaseClient.from().select().eq.mockResolvedValue({
      data: [],
      error: null,
    });
  });

  describe('getSystemSettings', () => {
    it('should return system settings from Supabase', async () => {
      const mockSettings = {
        summary_length: 150,
        target_audience: 'graduate student',
        include_citations: true,
        email_template: 'detailed',
        llm_model: 'gpt-4-turbo',
        llm_temperature: 0.5,
        llm_max_tokens: 1500,
      };

      mockSupabaseClient.from().select().single.mockResolvedValueOnce({
        data: mockSettings,
        error: null,
      });

      const result = await settingsService.getSystemSettings();

      expect(result).toEqual({
        summaryLength: 150,
        targetAudience: 'graduate student',
        includeCitations: true,
        emailTemplate: 'detailed',
        llmModel: 'gpt-4-turbo',
        llmTemperature: 0.5,
        llmMaxTokens: 1500,
      });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('system_settings');
    });

    it('should return default settings when Supabase fails', async () => {
      mockSupabaseClient.from().select().single.mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await settingsService.getSystemSettings();

      expect(result).toEqual({
        summaryLength: 100,
        targetAudience: 'college sophomore',
        includeCitations: true,
        emailTemplate: 'default',
        llmModel: 'gpt-4o',
        llmTemperature: 0.3,
        llmMaxTokens: 1000,
      });
    });

    it('should handle null data from Supabase', async () => {
      mockSupabaseClient.from().select().single.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await settingsService.getSystemSettings();

      expect(result).toEqual({
        summaryLength: 100,
        targetAudience: 'college sophomore',
        includeCitations: true,
        emailTemplate: 'default',
        llmModel: 'gpt-4o',
        llmTemperature: 0.3,
        llmMaxTokens: 1000,
      });
    });
  });

  describe('getSearchSettings', () => {
    it('should return search settings from Supabase', async () => {
      const mockSettings = {
        query: 'biotechnology innovation',
        max_results: 15,
        date_range: 'd30',
        sources: ['nature.com', 'science.org', 'cell.com'],
      };

      mockSupabaseClient.from().select().single.mockResolvedValueOnce({
        data: mockSettings,
        error: null,
      });

      const result = await settingsService.getSearchSettings();

      expect(result).toEqual({
        query: 'biotechnology innovation',
        maxResults: 15,
        dateRange: 'd30',
        sources: ['nature.com', 'science.org', 'cell.com'],
      });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('search_settings');
    });

    it('should return default search settings when Supabase fails', async () => {
      mockSupabaseClient.from().select().single.mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await settingsService.getSearchSettings();

      expect(result).toEqual({
        query: 'synthetic biology biotechnology',
        maxResults: 10,
        dateRange: 'd7',
        sources: ['nature.com', 'science.org', 'biorxiv.org'],
      });
    });
  });

  describe('getEmailRecipients', () => {
    it('should return email recipients from Supabase', async () => {
      const mockRecipients = [
        {
          id: 1,
          email: 'user1@example.com',
          name: 'User One',
          preferences: { frequency: 'daily', format: 'html' },
          active: true,
        },
        {
          id: 2,
          email: 'user2@example.com',
          name: 'User Two',
          preferences: { frequency: 'weekly', format: 'text' },
          active: true,
        },
      ];

      mockSupabaseClient.from().select().eq.mockResolvedValueOnce({
        data: mockRecipients,
        error: null,
      });

      const result = await settingsService.getEmailRecipients();

      expect(result).toEqual([
        {
          email: 'user1@example.com',
          name: 'User One',
          preferences: { frequency: 'daily', format: 'html' },
        },
        {
          email: 'user2@example.com',
          name: 'User Two',
          preferences: { frequency: 'weekly', format: 'text' },
        },
      ]);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('email_recipients');
    });

    it('should return empty array when Supabase fails', async () => {
      mockSupabaseClient.from().select.mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await settingsService.getEmailRecipients();

      expect(result).toEqual([]);
    });
  });

  describe('getAllSettings', () => {
    it('should return all settings combined', async () => {
      const mockSystemSettings = {
        summary_length: 150,
        target_audience: 'graduate student',
        include_citations: true,
        email_template: 'detailed',
        llm_model: 'gpt-4-turbo',
        llm_temperature: 0.5,
        llm_max_tokens: 1500,
      };

      const mockSearchSettings = {
        query: 'biotechnology innovation',
        max_results: 15,
        date_range: 'd30',
        sources: ['nature.com', 'science.org'],
      };

      const mockRecipients = [
        {
          id: 1,
          email: 'user@example.com',
          name: 'Test User',
          preferences: { frequency: 'daily', format: 'html' },
          active: true,
        },
      ];

      // Mock the chain of calls
      mockSupabaseClient.from().select().single
        .mockResolvedValueOnce({ data: mockSystemSettings, error: null })
        .mockResolvedValueOnce({ data: mockSearchSettings, error: null });
      
      mockSupabaseClient.from().select().eq.mockResolvedValueOnce({
        data: mockRecipients,
        error: null,
      });

      const result = await settingsService.getAllSettings();

      expect(result).toEqual({
        systemSettings: {
          summaryLength: 150,
          targetAudience: 'graduate student',
          includeCitations: true,
          emailTemplate: 'detailed',
          llmModel: 'gpt-4-turbo',
          llmTemperature: 0.5,
          llmMaxTokens: 1500,
        },
        searchSettings: {
          query: 'biotechnology innovation',
          maxResults: 15,
          dateRange: 'd30',
          sources: ['nature.com', 'science.org'],
        },
        recipients: [
          {
            email: 'user@example.com',
            name: 'Test User',
            preferences: { frequency: 'daily', format: 'html' },
          },
        ],
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing Supabase credentials', () => {
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const service = new SettingsService();
      
      // Should not throw error, but should log warning
      expect(service).toBeInstanceOf(SettingsService);

      // Restore environment variables
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
      process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
    });
  });
});
