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
          *,
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
        human_overall_score: row.human_overall_score,
        human_simple_terminology: row.human_simple_terminology,
        human_clear_concept: row.human_clear_concept,
        human_clear_methodology: row.human_clear_methodology,
        human_balanced_details: row.human_balanced_details,
        human_feedback: row.human_feedback,
        evaluated_by: row.evaluated_by,
        evaluated_at: row.evaluated_at ? new Date(row.evaluated_at) : undefined,
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
        .select('*')
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
        human_overall_score: data.human_overall_score,
        human_simple_terminology: data.human_simple_terminology,
        human_clear_concept: data.human_clear_concept,
        human_clear_methodology: data.human_clear_methodology,
        human_balanced_details: data.human_balanced_details,
        human_feedback: data.human_feedback,
        evaluated_by: data.evaluated_by,
        evaluated_at: data.evaluated_at ? new Date(data.evaluated_at) : undefined
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
        .select('*')
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
        human_overall_score: row.human_overall_score,
        human_simple_terminology: row.human_simple_terminology,
        human_clear_concept: row.human_clear_concept,
        human_clear_methodology: row.human_clear_methodology,
        human_balanced_details: row.human_balanced_details,
        human_feedback: row.human_feedback,
        evaluated_by: row.evaluated_by,
        evaluated_at: row.evaluated_at ? new Date(row.evaluated_at) : undefined
      }));

    } catch (error) {
      console.error('Error fetching recent daily summaries:', error);
      return [];
    }
  }

  /**
   * Add human evaluation to a summary (for future use case 2)
   */
  async addHumanEvaluation(
    summaryId: string,
    summaryType: 'article' | 'daily',
    evaluation: {
      overallScore: number;
      simpleTerminology: number;
      clearConcept: number;
      clearMethodology: number;
      balancedDetails: number;
      feedback: string;
      evaluatedBy: string;
    }
  ): Promise<void> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const tableName = summaryType === 'article' ? 'article_summaries' : 'daily_summaries';
      
      const { error } = await this.supabase
        .from(tableName)
        .update({
          human_overall_score: evaluation.overallScore,
          human_simple_terminology: evaluation.simpleTerminology,
          human_clear_concept: evaluation.clearConcept,
          human_clear_methodology: evaluation.clearMethodology,
          human_balanced_details: evaluation.balancedDetails,
          human_feedback: evaluation.feedback,
          evaluated_by: evaluation.evaluatedBy,
          evaluated_at: new Date().toISOString()
        })
        .eq('id', summaryId);

      if (error) {
        throw new Error(`Failed to add human evaluation: ${error.message}`);
      }

      console.log(`✅ Added human evaluation to ${summaryType} summary ${summaryId}`);

    } catch (error) {
      console.error('Error adding human evaluation:', error);
      throw error;
    }
  }

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
