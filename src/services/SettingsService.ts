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

      // Always use ID = 1 for singleton settings
      const { data, error } = await this.supabase
        .from('system_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to fetch system settings: ${error.message}`);
      }

      // If no settings exist, return defaults
      if (!data) {
        console.log('No system settings found in database, returning defaults');
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

      // Return settings with defaults if not found
      return {
        summaryLength: data?.summary_length || 100,
        targetAudience: data?.target_audience || 'college sophomore',
        includeCitations: data?.include_citations ?? true,
        emailTemplate: data?.email_template || 'default',
        llmModel: data?.llm_model || 'gpt-4o',
        llmTemperature: data?.llm_temperature ?? 0.3,
        llmMaxTokens: data?.llm_max_tokens || 1000,
        relevancyThreshold: data?.relevancy_threshold ?? 0.2
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

      // Always use ID = 1 for singleton settings
      const { data, error } = await this.supabase
        .from('search_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to fetch search settings: ${error.message}`);
      }

      // If no settings exist, return defaults
      if (!data) {
        console.log('No search settings found in database, returning defaults');
        return {
          query: 'synthetic biology biotechnology',
          maxResults: 10,
          dateRange: this.convertHoursToGoogleDateRange(24), // Default to 24 hours
          sources: ['nature.com', 'science.org', 'biorxiv.org'],
          timeWindow: 24
        };
      }

      const result = {
        query: data?.query || 'synthetic biology biotechnology',
        maxResults: Math.min(data?.max_results || 10, 100), // Cap at 100 (Google API limit)
        dateRange: this.convertHoursToGoogleDateRange(data?.time_window || 24),
        sources: data?.sources || ['nature.com', 'science.org', 'biorxiv.org'],
        timeWindow: data?.time_window || 24
      };

      console.log('📖 Retrieved search settings from database:', {
        rawData: data,
        processedResult: result
      });

      return result;

    } catch (error) {
      console.error('Error fetching search settings:', error);
      
      // Return default settings on error
      return {
        query: 'synthetic biology biotechnology',
        maxResults: 10,
        dateRange: this.convertHoursToGoogleDateRange(24), // Default to 24 hours
        sources: ['nature.com', 'science.org', 'biorxiv.org'],
        timeWindow: 24
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

      // Always use ID = 1 for singleton settings
      const updateData = {
        id: 1,
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
        .upsert(updateData, { onConflict: 'id' });

      if (error) {
        throw new Error(`Failed to update system settings: ${error.message}`);
      }

    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  }

  /**
   * Update search settings in Supabase
   */
  async updateSearchSettings(settings: Partial<SearchSettings>): Promise<void> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      console.log('🔧 Updating search settings:', {
        query: settings.query,
        maxResults: settings.maxResults,
        timeWindow: settings.timeWindow,
        sources: settings.sources
      });

      // Always use ID = 1 for singleton settings
      const updateData = {
        id: 1,
        query: settings.query,
        max_results: settings.maxResults ? Math.min(settings.maxResults, 100) : undefined, // Cap at 100 (Google API limit)
        time_window: settings.timeWindow,
        sources: settings.sources,
        updated_at: new Date().toISOString()
      };

      console.log('📝 Database update data:', updateData);

      const { error } = await this.supabase
        .from('search_settings')
        .upsert(updateData, { onConflict: 'id' });

      if (error) {
        console.error('❌ Database update error:', error);
        throw new Error(`Failed to update search settings: ${error.message}`);
      }

      console.log('✅ Search settings updated successfully');

    } catch (error) {
      console.error('Error updating search settings:', error);
      throw error;
    }
  }

  /**
   * Add or update email recipient in Supabase
   */
  async upsertEmailRecipient(recipient: EmailRecipient): Promise<void> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { error } = await this.supabase
        .from('email_recipients')
        .upsert({
          email: recipient.email,
          name: recipient.name,
          preferences: recipient.preferences,
          active: true,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Failed to upsert email recipient: ${error.message}`);
      }

    } catch (error) {
      console.error('Error upserting email recipient:', error);
      throw error;
    }
  }

  /**
   * Delete email recipient from Supabase
   */
  async deleteEmailRecipient(email: string): Promise<void> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { error } = await this.supabase
        .from('email_recipients')
        .delete()
        .eq('email', email);

      if (error) {
        throw new Error(`Failed to delete email recipient: ${error.message}`);
      }

    } catch (error) {
      console.error('Error deleting email recipient:', error);
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

  /**
   * Convert hours to Google Custom Search API date range format
   */
  private convertHoursToGoogleDateRange(hours: number): string {
    if (hours <= 24) return 'd1';
    if (hours <= 48) return 'd2';
    if (hours <= 72) return 'd3';
    if (hours <= 168) return 'd7';  // 7 days
    if (hours <= 720) return 'd30'; // 30 days
    if (hours <= 2160) return 'm3'; // 90 days
    return 'y1'; // 1 year
  }
}

// Export singleton instance
export const settingsService = new SettingsService();

