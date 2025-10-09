import { createClient } from '@supabase/supabase-js';
import { SystemSettings, SearchSettings, EmailRecipient } from '@/types/agent';

export class SettingsService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not configured for SettingsService');
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Get system settings from Supabase
   */
  async getSystemSettings(): Promise<SystemSettings> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await this.supabase
        .from('system_settings')
        .select('*')
        .single();

      if (error) {
        throw new Error(`Failed to fetch system settings: ${error.message}`);
      }

      // Return settings with defaults if not found
      return {
        summaryLength: data?.summary_length || 100,
        targetAudience: data?.target_audience || 'college sophomore',
        includeCitations: data?.include_citations || true,
        emailTemplate: data?.email_template || 'default',
        llmModel: data?.llm_model || 'gpt-4o',
        llmTemperature: data?.llm_temperature || 0.3,
        llmMaxTokens: data?.llm_max_tokens || 1000,
        relevancyThreshold: data?.relevancy_threshold || 0.2
      };

    } catch (error) {
      console.error('Error fetching system settings:', error);
      
      // Return default settings on error
      return {
        summaryLength: 100,
        targetAudience: 'college sophomore',
        includeCitations: true,
        emailTemplate: 'default',
        llmModel: 'gpt-4o',
        llmTemperature: 0.3,
        llmMaxTokens: 1000,
        relevancyThreshold: 0.2
      };
    }
  }

  /**
   * Get search settings from Supabase
   */
  async getSearchSettings(): Promise<SearchSettings> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await this.supabase
        .from('search_settings')
        .select('*')
        .single();

      if (error) {
        throw new Error(`Failed to fetch search settings: ${error.message}`);
      }

      return {
        query: data?.query || 'synthetic biology biotechnology',
        maxResults: data?.max_results || 10,
        dateRange: data?.date_range || 'd7',
        sources: data?.sources || ['nature.com', 'science.org', 'biorxiv.org']
      };

    } catch (error) {
      console.error('Error fetching search settings:', error);
      
      // Return default settings on error
      return {
        query: 'synthetic biology biotechnology',
        maxResults: 10,
        dateRange: 'd7',
        sources: ['nature.com', 'science.org', 'biorxiv.org']
      };
    }
  }

  /**
   * Get email recipients from Supabase
   */
  async getEmailRecipients(): Promise<EmailRecipient[]> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await this.supabase
        .from('email_recipients')
        .select('*')
        .eq('active', true);

      if (error) {
        throw new Error(`Failed to fetch email recipients: ${error.message}`);
      }

      return (data || []).map(recipient => ({
        email: recipient.email,
        name: recipient.name,
        preferences: {
          frequency: recipient.preferences?.frequency || 'daily',
          format: recipient.preferences?.format || 'html'
        }
      }));

    } catch (error) {
      console.error('Error fetching email recipients:', error);
      
      // Return default recipient on error
      return [{
        email: 'test@example.com',
        name: 'Test User',
        preferences: {
          frequency: 'daily',
          format: 'html'
        }
      }];
    }
  }

  /**
   * Get all settings from Supabase
   */
  async getAllSettings(): Promise<{
    searchSettings: SearchSettings;
    systemSettings: SystemSettings;
    recipients: EmailRecipient[];
  }> {
    try {
      const [searchSettings, systemSettings, recipients] = await Promise.all([
        this.getSearchSettings(),
        this.getSystemSettings(),
        this.getEmailRecipients()
      ]);

      return {
        searchSettings,
        systemSettings,
        recipients
      };

    } catch (error) {
      console.error('Error fetching all settings:', error);
      throw error;
    }
  }

  /**
   * Update system settings in Supabase
   */
  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<void> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const updateData = {
        summary_length: settings.summaryLength,
        target_audience: settings.targetAudience,
        include_citations: settings.includeCitations,
        email_template: settings.emailTemplate,
        llm_model: settings.llmModel,
        llm_temperature: settings.llmTemperature,
        llm_max_tokens: settings.llmMaxTokens,
        relevancy_threshold: settings.relevancyThreshold,
        updated_at: new Date().toISOString()
      };

      const { error } = await this.supabase
        .from('system_settings')
        .upsert(updateData);

      if (error) {
        throw new Error(`Failed to update system settings: ${error.message}`);
      }

    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  }

  /**
   * Get available OpenAI models
   */
  getAvailableModels(): Array<{
    id: string;
    name: string;
    description: string;
    maxTokens: number;
    costPer1kTokens: number;
  }> {
    return [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Most capable model, best for complex reasoning',
        maxTokens: 128000,
        costPer1kTokens: 0.005
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'Fast and cost-effective for most tasks',
        maxTokens: 128000,
        costPer1kTokens: 0.00015
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: 'High performance with large context',
        maxTokens: 128000,
        costPer1kTokens: 0.01
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and efficient for simple tasks',
        maxTokens: 16385,
        costPer1kTokens: 0.0005
      }
    ];
  }
}

// Export singleton instance
export const settingsService = new SettingsService();

