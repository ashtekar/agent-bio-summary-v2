import { createClient } from '@supabase/supabase-js';
import { Thread } from '@/types/agent';
import { randomUUID } from 'crypto';

export class ThreadService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not configured for ThreadService');
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Create a new thread for a daily summary run
   */
  async createThread(params: {
    run_date: string;
    metadata?: Thread['metadata'];
  }): Promise<Thread> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const threadId = randomUUID();
      const now = new Date();

      const threadData = {
        id: threadId,
        run_date: params.run_date,
        status: 'running' as const,
        articles_found: 0,
        articles_processed: 0,
        email_sent: false,
        started_at: now.toISOString(),
        metadata: params.metadata || {}
      };

      const { data, error } = await this.supabase
        .from('threads')
        .insert(threadData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create thread: ${error.message}`);
      }

      console.log(`✅ Created thread: ${threadId} for run_date: ${params.run_date}`);
      
      return {
        id: data.id,
        run_date: data.run_date,
        status: data.status,
        articles_found: data.articles_found,
        articles_processed: data.articles_processed,
        email_sent: data.email_sent,
        langsmith_url: data.langsmith_url,
        error_message: data.error_message,
        started_at: new Date(data.started_at),
        completed_at: data.completed_at ? new Date(data.completed_at) : undefined,
        metadata: data.metadata
      };

    } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
    }
  }

  /**
   * Update thread metrics during execution
   */
  async updateThread(
    threadId: string,
    updates: Partial<{
      articles_found: number;
      articles_processed: number;
      status: Thread['status'];
    }>
  ): Promise<void> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { error } = await this.supabase
        .from('threads')
        .update(updates)
        .eq('id', threadId);

      if (error) {
        throw new Error(`Failed to update thread: ${error.message}`);
      }

      console.log(`✅ Updated thread: ${threadId}`, updates);

    } catch (error) {
      console.error('Error updating thread:', error);
      throw error;
    }
  }

  /**
   * Complete a thread (mark as completed or failed)
   */
  async completeThread(
    threadId: string,
    params: {
      status: 'completed' | 'failed';
      email_sent: boolean;
      langsmith_url?: string;
      langsmith_run_id?: string;
      articles_found?: number;
      articles_processed?: number;
      error_message?: string;
    }
  ): Promise<void> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const updateData = {
        status: params.status,
        email_sent: params.email_sent,
        langsmith_url: params.langsmith_url,
        langsmith_run_id: params.langsmith_run_id,
        error_message: params.error_message,
        completed_at: new Date().toISOString(),
        ...(params.articles_found !== undefined && { articles_found: params.articles_found }),
        ...(params.articles_processed !== undefined && { articles_processed: params.articles_processed })
      };

      const { error } = await this.supabase
        .from('threads')
        .update(updateData)
        .eq('id', threadId);

      if (error) {
        throw new Error(`Failed to complete thread: ${error.message}`);
      }

      console.log(`✅ Completed thread: ${threadId} with status: ${params.status}`);

    } catch (error) {
      console.error('Error completing thread:', error);
      throw error;
    }
  }

  /**
   * Get a thread by ID
   */
  async getThread(threadId: string): Promise<Thread | null> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await this.supabase
        .from('threads')
        .select('*')
        .eq('id', threadId)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to fetch thread: ${error.message}`);
      }

      if (!data) return null;

      return {
        id: data.id,
        run_date: data.run_date,
        status: data.status,
        articles_found: data.articles_found,
        articles_processed: data.articles_processed,
        email_sent: data.email_sent,
        langsmith_url: data.langsmith_url,
        error_message: data.error_message,
        started_at: new Date(data.started_at),
        completed_at: data.completed_at ? new Date(data.completed_at) : undefined,
        metadata: data.metadata
      };

    } catch (error) {
      console.error('Error fetching thread:', error);
      return null;
    }
  }

  /**
   * Get recent threads (for frontend display)
   */
  async getRecentThreads(limit: number = 10): Promise<Thread[]> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await this.supabase
        .from('threads')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch threads: ${error.message}`);
      }

      return (data || []).map(row => ({
        id: row.id,
        run_date: row.run_date,
        status: row.status,
        articles_found: row.articles_found,
        articles_processed: row.articles_processed,
        email_sent: row.email_sent,
        langsmith_url: row.langsmith_url,
        error_message: row.error_message,
        started_at: new Date(row.started_at),
        completed_at: row.completed_at ? new Date(row.completed_at) : undefined,
        metadata: row.metadata
      }));

    } catch (error) {
      console.error('Error fetching recent threads:', error);
      return [];
    }
  }

  /**
   * Get thread by run date
   */
  async getThreadByDate(runDate: string): Promise<Thread | null> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await this.supabase
        .from('threads')
        .select('*')
        .eq('run_date', runDate)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to fetch thread by date: ${error.message}`);
      }

      if (!data) return null;

      return {
        id: data.id,
        run_date: data.run_date,
        status: data.status,
        articles_found: data.articles_found,
        articles_processed: data.articles_processed,
        email_sent: data.email_sent,
        langsmith_url: data.langsmith_url,
        error_message: data.error_message,
        started_at: new Date(data.started_at),
        completed_at: data.completed_at ? new Date(data.completed_at) : undefined,
        metadata: data.metadata
      };

    } catch (error) {
      console.error('Error fetching thread by date:', error);
      return null;
    }
  }
}

// Export singleton instance
export const threadService = new ThreadService();

