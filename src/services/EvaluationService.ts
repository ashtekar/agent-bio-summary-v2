import { createClient } from '@supabase/supabase-js';

export interface EvaluationRecord {
  id: string;
  summary_id: string;
  grader_email: string;
  grader_name?: string;
  simple_terminology: number;
  clear_concept: number;
  clear_methodology: number;
  balanced_details: number;
  feedback?: string;
  created_at: Date;
  // Joined data from article_summaries
  summary?: string;
  article_title?: string;
  article_url?: string;
}

export interface CreateEvaluationInput {
  summaryId: string;
  graderEmail: string;
  graderName?: string;
  simpleTerminology: number; // 1-10 scale
  clearConcept: number; // 1-10 scale
  clearMethodology: number; // 1-10 scale
  balancedDetails: number; // 1-10 scale
  feedback?: string; // Optional, max 50 words
}

export class EvaluationService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not configured for EvaluationService');
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Normalize score from 1-10 scale to 0-1 scale
   */
  private normalizeScore(score: number): number {
    return Math.max(0, Math.min(1, score / 10));
  }

  /**
   * Save evaluation (normalizes scores before storing)
   */
  async saveEvaluation(input: CreateEvaluationInput): Promise<EvaluationRecord> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Normalize scores from 1-10 to 0-1
      const normalizedData = {
        summary_id: input.summaryId,
        grader_email: input.graderEmail.toLowerCase().trim(),
        grader_name: input.graderName || null,
        simple_terminology: this.normalizeScore(input.simpleTerminology),
        clear_concept: this.normalizeScore(input.clearConcept),
        clear_methodology: this.normalizeScore(input.clearMethodology),
        balanced_details: this.normalizeScore(input.balancedDetails),
        feedback: input.feedback?.trim() || null
      };

      const { data, error } = await this.supabase
        .from('summary_evaluations')
        .insert(normalizedData)
        .select()
        .single();

      if (error) {
        // If unique constraint violation, update instead
        if (error.code === '23505') {
          const { data: updated, error: updateError } = await this.supabase
            .from('summary_evaluations')
            .update(normalizedData)
            .eq('summary_id', input.summaryId)
            .eq('grader_email', input.graderEmail.toLowerCase().trim())
            .select()
            .single();

          if (updateError) {
            throw new Error(`Failed to update evaluation: ${updateError.message}`);
          }

          return this.mapToEvaluationRecord(updated);
        }
        throw new Error(`Failed to save evaluation: ${error.message}`);
      }

      console.log(`? Saved evaluation for summary ${input.summaryId} by ${input.graderEmail}`);
      return this.mapToEvaluationRecord(data);

    } catch (error) {
      console.error('Error saving evaluation:', error);
      throw error;
    }
  }

  /**
   * Get all evaluations for a specific summary
   */
  async getEvaluationsBySummary(summaryId: string): Promise<EvaluationRecord[]> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await this.supabase
        .from('summary_evaluations')
        .select('*')
        .eq('summary_id', summaryId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch evaluations: ${error.message}`);
      }

      return (data || []).map(row => this.mapToEvaluationRecord(row));

    } catch (error) {
      console.error('Error fetching evaluations:', error);
      return [];
    }
  }

  /**
   * Get all evaluations by a specific grader
   */
  async getEvaluationsByGrader(graderEmail: string): Promise<EvaluationRecord[]> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await this.supabase
        .from('summary_evaluations')
        .select('*')
        .eq('grader_email', graderEmail.toLowerCase().trim())
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch evaluations: ${error.message}`);
      }

      return (data || []).map(row => this.mapToEvaluationRecord(row));

    } catch (error) {
      console.error('Error fetching evaluations:', error);
      return [];
    }
  }

  /**
   * Get all evaluations (for table view)
   * Note: Summary details are fetched separately by the frontend when needed
   */
  async getAllEvaluations(limit: number = 100): Promise<EvaluationRecord[]> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await this.supabase
        .from('summary_evaluations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch evaluations: ${error.message}`);
      }

      return (data || []).map(row => this.mapToEvaluationRecord(row));

    } catch (error) {
      console.error('Error fetching all evaluations:', error);
      return [];
    }
  }

  /**
   * Get summary ID from article summary ID (for linking from email)
   */
  async getSummaryIdFromArticleSummary(articleSummaryId: string): Promise<string | null> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      // First try direct match
      const { data, error } = await this.supabase
        .from('article_summaries')
        .select('id')
        .eq('id', articleSummaryId)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to fetch summary: ${error.message}`);
      }

      return data?.id || null;

    } catch (error) {
      console.error('Error fetching summary ID:', error);
      return null;
    }
  }

  /**
   * Get next ungraded summary for a grader
   */
  async getNextUngradedSummary(graderEmail: string, threadId?: string): Promise<string | null> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Get all article summaries
      let query = this.supabase
        .from('article_summaries')
        .select('id, thread_id');

      if (threadId) {
        query = query.eq('thread_id', threadId);
      }

      const { data: summaries, error: summariesError } = await query;

      if (summariesError || !summaries) {
        return null;
      }

      // Get evaluations by this grader
      const { data: evaluations, error: evalError } = await this.supabase
        .from('summary_evaluations')
        .select('summary_id')
        .eq('grader_email', graderEmail.toLowerCase().trim());

      if (evalError) {
        return null;
      }

      const evaluatedSummaryIds = new Set(
        (evaluations || []).map(e => e.summary_id)
      );

      // Find first summary not yet evaluated by this grader
      const ungradedSummary = summaries.find(s => !evaluatedSummaryIds.has(s.id));

      return ungradedSummary?.id || null;

    } catch (error) {
      console.error('Error finding next ungraded summary:', error);
      return null;
    }
  }

  /**
   * Map database row to EvaluationRecord
   */
  private mapToEvaluationRecord(row: any): EvaluationRecord {
    return {
      id: row.id,
      summary_id: row.summary_id,
      grader_email: row.grader_email,
      grader_name: row.grader_name,
      simple_terminology: row.simple_terminology,
      clear_concept: row.clear_concept,
      clear_methodology: row.clear_methodology,
      balanced_details: row.balanced_details,
      feedback: row.feedback,
      created_at: new Date(row.created_at)
    };
  }
}

// Export singleton instance
export const evaluationService = new EvaluationService();
