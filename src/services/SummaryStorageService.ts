import { createClient } from '@supabase/supabase-js';
import { ArticleSummaryRecord, DailySummaryRecord } from '@/types/agent';

export class SummaryStorageService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not configured for SummaryStorageService');
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Save individual article summary
   */
  async saveArticleSummary(data: {
    articleId: string;
    threadId: string;
    summary: string;
    modelUsed: string;
    langsmithRunId: string;
  }): Promise<void> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { error } = await this.supabase
        .from('article_summaries')
        .insert({
          article_id: data.articleId,
          thread_id: data.threadId,
          summary: data.summary,
          model_used: data.modelUsed,
          langsmith_run_id: data.langsmithRunId
        });

      if (error) {
        throw new Error(`Failed to save article summary: ${error.message}`);
      }

      console.log(`✅ Saved article summary for article ${data.articleId} in thread ${data.threadId}`);

    } catch (error) {
      console.error('Error saving article summary:', error);
      throw error;
    }
  }

  /**
   * Save daily collated summary
   */
  async saveDailySummary(data: {
    threadId: string;
    collatedSummary: string;
    htmlContent?: string;
    collationModel: string;
    articlesSummarized: number;
    langsmithRunId: string;
  }): Promise<void> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { error } = await this.supabase
        .from('daily_summaries')
        .insert({
          thread_id: data.threadId,
          collated_summary: data.collatedSummary,
          html_content: data.htmlContent || null,
          collation_model: data.collationModel,
          articles_summarized: data.articlesSummarized,
          langsmith_run_id: data.langsmithRunId
        });

      if (error) {
        throw new Error(`Failed to save daily summary: ${error.message}`);
      }

      console.log(`✅ Saved daily summary for thread ${data.threadId}`);

    } catch (error) {
      console.error('Error saving daily summary:', error);
      throw error;
    }
  }

  /**
   * Get article summaries for a specific thread
   */
  async getArticleSummariesByThread(threadId: string): Promise<ArticleSummaryRecord[]> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await this.supabase
        .from('article_summaries')
        .select(`
          id,
          article_id,
          thread_id,
          summary,
          model_used,
          langsmith_run_id,
          created_at,
          articles:article_id (
            id,
            title,
            url,
            source,
            relevancy_score
          )
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch article summaries: ${error.message}`);
      }

      return (data || []).map(row => ({
        id: row.id,
        article_id: row.article_id,
        thread_id: row.thread_id,
        summary: row.summary,
        model_used: row.model_used,
        langsmith_run_id: row.langsmith_run_id,
        created_at: new Date(row.created_at),
        // Human evaluation fields removed - use EvaluationService instead
        // Add article metadata from join
        article_title: row.articles?.title,
        article_url: row.articles?.url,
        article_source: row.articles?.source,
        article_relevancy_score: row.articles?.relevancy_score
      }));

    } catch (error) {
      console.error('Error fetching article summaries:', error);
      return [];
    }
  }

  /**
   * Get daily summary for a specific thread
   */
  async getDailySummary(threadId: string): Promise<DailySummaryRecord | null> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await this.supabase
        .from('daily_summaries')
        .select(`
          id,
          thread_id,
          collated_summary,
          html_content,
          collation_model,
          articles_summarized,
          langsmith_run_id,
          created_at
        `)
        .eq('thread_id', threadId)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to fetch daily summary: ${error.message}`);
      }

      if (!data) return null;

      return {
        id: data.id,
        thread_id: data.thread_id,
        collated_summary: data.collated_summary,
        html_content: data.html_content,
        collation_model: data.collation_model,
        articles_summarized: data.articles_summarized,
        langsmith_run_id: data.langsmith_run_id,
        created_at: new Date(data.created_at),
        // Human evaluation fields removed - use EvaluationService instead
      };

    } catch (error) {
      console.error('Error fetching daily summary:', error);
      return null;
    }
  }

  /**
   * Get recent daily summaries (for dashboard display)
   */
  async getRecentDailySummaries(limit: number = 20): Promise<DailySummaryRecord[]> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await this.supabase
        .from('daily_summaries')
        .select(`
          id,
          thread_id,
          collated_summary,
          html_content,
          collation_model,
          articles_summarized,
          langsmith_run_id,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch recent daily summaries: ${error.message}`);
      }

      return (data || []).map(row => ({
        id: row.id,
        thread_id: row.thread_id,
        collated_summary: row.collated_summary,
        html_content: row.html_content,
        collation_model: row.collation_model,
        articles_summarized: row.articles_summarized,
        langsmith_run_id: row.langsmith_run_id,
        created_at: new Date(row.created_at),
        // Human evaluation fields removed - use EvaluationService instead
      }));

    } catch (error) {
      console.error('Error fetching recent daily summaries:', error);
      return [];
    }
  }

  // Removed addHumanEvaluation() - use EvaluationService.saveEvaluation() instead
  // Old method supported only one evaluation per summary.
  // New system supports multiple graders via summary_evaluations table.

  /**
   * Export human score to LangSmith (for future use case 3)
   */
  async exportHumanScoreToLangSmith(summaryId: string, summaryType: 'article' | 'daily'): Promise<void> {
    try {
      // This would integrate with LangSmith API to create annotations
      // For now, just log the action
      console.log(`📤 Exporting human evaluation for ${summaryType} summary ${summaryId} to LangSmith`);
      
      // TODO: Implement LangSmith annotation creation
      // This would require:
      // 1. Fetch the summary record with human evaluation
      // 2. Create annotation in LangSmith using the langsmith_run_id
      // 3. Link human scores to the trace for comparison with automated scores
      
    } catch (error) {
      console.error('Error exporting human score to LangSmith:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const summaryStorageService = new SummaryStorageService();
