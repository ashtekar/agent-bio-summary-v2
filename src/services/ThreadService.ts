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
   * @param params - Thread creation parameters
   * @param userId - User ID (required for user-specific threads)
   */
  async createThread(params: {
    run_date: string;
    metadata?: Thread['metadata'];
  }, userId?: string): Promise<Thread> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      if (!userId) {
        throw new Error('User ID is required to create thread');
      }

      const threadId = randomUUID();
      const now = new Date();

      const threadData = {
        id: threadId,
        run_date: params.run_date,
        user_id: userId,
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
   * Get or create a thread for a daily summary run
   * This method handles race conditions atomically using PostgreSQL INSERT ... ON CONFLICT
   * @param params - Thread creation parameters
   * @param userId - User ID (required for user-specific threads)
   */
  async getOrCreateThread(params: {
    run_date: string;
    metadata?: Thread['metadata'];
  }, userId?: string): Promise<Thread> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      if (!userId) {
        throw new Error('User ID is required to get or create thread');
      }

      const threadId = randomUUID();
      const now = new Date();

      // Use PostgreSQL INSERT ... ON CONFLICT to atomically handle race conditions
      // This ensures only one thread is created per (user_id, run_date) even with concurrent requests
      const threadData = {
        id: threadId,
        run_date: params.run_date,
        user_id: userId,
        status: 'running' as const,
        articles_found: 0,
        articles_processed: 0,
        email_sent: false,
        started_at: now.toISOString(),
        metadata: params.metadata || {}
      };

      // Try to insert, and if run_date already exists, return the existing thread
      // Using upsert with ON CONFLICT to handle race conditions
      const { data, error } = await this.supabase
        .from('threads')
        .insert(threadData)
        .select()
        .single();

      if (error) {
        // If duplicate key error (race condition), fetch existing thread
        if (error.code === '23505' || error.message.includes('duplicate key')) {
          console.log(`⚠️ Thread already exists for run_date: ${params.run_date}, fetching existing thread...`);
          
          const existingThread = await this.getThreadByDate(params.run_date, userId);
          
          if (existingThread) {
            console.log(`✅ Found existing thread: ${existingThread.id} for run_date: ${params.run_date}`);
            
            // If the existing thread is completed or failed, reset it to running
            if (existingThread.status !== 'running') {
              const { error: updateError } = await this.supabase
                .from('threads')
                .update({
                  status: 'running',
                  started_at: now.toISOString(),
                  completed_at: null,
                  articles_found: 0,
                  articles_processed: 0,
                  email_sent: false,
                  error_message: null,
                  metadata: params.metadata || existingThread.metadata
                })
                .eq('id', existingThread.id);

              if (updateError) {
                console.warn(`Failed to reset thread ${existingThread.id}:`, updateError.message);
              } else {
                console.log(`✅ Reset thread ${existingThread.id} to running state`);
              }
              
              // Fetch the updated thread
              return (await this.getThread(existingThread.id, userId)) || existingThread;
            }
            
            return existingThread;
          } else {
            // Thread should exist but query failed, throw original error
            throw new Error(`Failed to create thread: ${error.message}`);
          }
        } else {
          // Some other error
          throw new Error(`Failed to create thread: ${error.message}`);
        }
      }

      // Successfully created new thread
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
      console.error('Error in getOrCreateThread:', error);
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
   * Get thread by ID
   * @param threadId - Thread ID
   * @param userId - Optional user ID to verify ownership
   */
  async getThread(threadId: string, userId?: string): Promise<Thread | null> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      let query = this.supabase
        .from('threads')
        .select('*')
        .eq('id', threadId);

      // Filter by user_id if provided
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.maybeSingle();

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
   * @param limit - Maximum number of threads to return
   * @param userId - Optional user ID to filter by user
   */
  async getRecentThreads(limit: number = 10, userId?: string): Promise<Thread[]> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      if (!userId) {
        throw new Error('User ID is required to get recent threads');
      }

      let query = this.supabase
        .from('threads')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(limit);

      const { data, error } = await query;

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
   * @param runDate - Run date (YYYY-MM-DD)
   * @param userId - User ID (required for user-specific threads)
   */
  async getThreadByDate(runDate: string, userId?: string): Promise<Thread | null> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      if (!userId) {
        throw new Error('User ID is required to get thread by date');
      }

      const { data, error } = await this.supabase
        .from('threads')
        .select('*')
        .eq('run_date', runDate)
        .eq('user_id', userId)
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

