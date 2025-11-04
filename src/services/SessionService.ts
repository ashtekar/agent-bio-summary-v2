import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SessionData } from './AuthService';

/**
 * Session Management Service
 * 
 * Provides session CRUD operations, validation, and cleanup.
 */
export interface CreateSessionParams {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  expiresInDays?: number; // Default: 7 days
}

export class SessionService {
  private supabase: SupabaseClient | null = null;

  private getSupabase(): SupabaseClient {
    if (!this.supabase) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials not configured for SessionService');
      }

      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
    return this.supabase;
  }

  constructor() {
    // Lazy initialization - supabase will be created when first method is called
  }

  /**
   * Create a new user session
   */
  async createSession(params: CreateSessionParams): Promise<SessionData | null> {
    try {
      const supabase = this.getSupabase();
      const {
        userId,
        ipAddress,
        userAgent,
        expiresInDays = 7
      } = params;

      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
          ip_address: ipAddress || null,
          user_agent: userAgent || null,
          active: true
        })
        .select()
        .single();

      if (error) {
        console.error('[SESSION] Create session error:', error);
        return null;
      }

      return data as SessionData;
    } catch (error: any) {
      console.error('[SESSION] Create session exception:', error);
      return null;
    }
  }

  /**
   * Validate a session token and return session data
   */
  async validateSession(sessionToken: string): Promise<{
    valid: boolean;
    session?: SessionData;
    userId?: string;
    error?: string;
  }> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .eq('active', true)
        .single();

      if (error || !data) {
        return { valid: false, error: 'Session not found or inactive' };
      }

      const session = data as SessionData;

      // Check if session is expired
      const expiresAt = new Date(session.expires_at);
      if (expiresAt < new Date()) {
        // Mark session as inactive
        await this.revokeSession(sessionToken);
        return { valid: false, error: 'Session expired' };
      }

      // Update last activity
      await this.updateLastActivity(sessionToken);

      return {
        valid: true,
        session,
        userId: session.user_id
      };
    } catch (error: any) {
      console.error('[SESSION] Validate session exception:', error);
      return { valid: false, error: error.message || 'Failed to validate session' };
    }
  }

  /**
   * Refresh a session (extend expiration)
   */
  async refreshSession(sessionToken: string, expiresInDays: number = 7): Promise<boolean> {
    try {
      const supabase = this.getSupabase();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      const { error } = await supabase
        .from('user_sessions')
        .update({
          expires_at: expiresAt.toISOString(),
          last_activity: new Date().toISOString()
        })
        .eq('session_token', sessionToken)
        .eq('active', true);

      if (error) {
        console.error('[SESSION] Refresh session error:', error);
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('[SESSION] Refresh session exception:', error);
      return false;
    }
  }

  /**
   * Revoke a session (mark as inactive)
   */
  async revokeSession(sessionToken: string): Promise<boolean> {
    try {
      const supabase = this.getSupabase();
      const { error } = await supabase
        .from('user_sessions')
        .update({
          active: false
        })
        .eq('session_token', sessionToken);

      if (error) {
        console.error('[SESSION] Revoke session error:', error);
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('[SESSION] Revoke session exception:', error);
      return false;
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserActiveSessions(userId: string): Promise<SessionData[]> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .gt('expires_at', new Date().toISOString())
        .order('last_activity', { ascending: false });

      if (error) {
        console.error('[SESSION] Get user sessions error:', error);
        return [];
      }

      return (data || []) as SessionData[];
    } catch (error: any) {
      console.error('[SESSION] Get user sessions exception:', error);
      return [];
    }
  }

  /**
   * Revoke all sessions for a user (logout from all devices)
   */
  async revokeAllUserSessions(userId: string): Promise<boolean> {
    try {
      const supabase = this.getSupabase();
      const { error } = await supabase
        .from('user_sessions')
        .update({
          active: false
        })
        .eq('user_id', userId)
        .eq('active', true);

      if (error) {
        console.error('[SESSION] Revoke all sessions error:', error);
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('[SESSION] Revoke all sessions exception:', error);
      return false;
    }
  }

  /**
   * Cleanup expired sessions (should be run periodically)
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('user_sessions')
        .update({
          active: false
        })
        .lt('expires_at', new Date().toISOString())
        .eq('active', true)
        .select('id');

      if (error) {
        console.error('[SESSION] Cleanup expired sessions error:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error: any) {
      console.error('[SESSION] Cleanup expired sessions exception:', error);
      return 0;
    }
  }

  /**
   * Update last activity timestamp for a session
   */
  private async updateLastActivity(sessionToken: string): Promise<void> {
    try {
      const supabase = this.getSupabase();
      await supabase
        .from('user_sessions')
        .update({
          last_activity: new Date().toISOString()
        })
        .eq('session_token', sessionToken);
    } catch (error) {
      console.error('[SESSION] Update last activity error:', error);
      // Don't throw - this is a non-critical operation
    }
  }

  /**
   * Generate a secure random session token
   */
  private generateSessionToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }
}

// Export singleton instance
export const sessionService = new SessionService();

