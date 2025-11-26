import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

/**
 * Authentication Service
 * 
 * Provides passwordless authentication via OTP and magic links.
 * OTP is the primary method used by the UI, magic link is available for backend use.
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
  last_active_at: string | null;
  preferences: Record<string, any>;
}

export interface SessionData {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  created_at: string;
  last_activity: string;
  ip_address: string | null;
  user_agent: string | null;
  active: boolean;
}

export class AuthService {
  private supabase: SupabaseClient | null = null;
  private supabaseUrl: string;
  private serviceRoleKey: string;

  private getSupabase(): SupabaseClient {
    if (!this.supabase) {
      if (!this.supabaseUrl || !this.serviceRoleKey) {
        throw new Error('Supabase credentials not configured for AuthService');
      }

      this.supabase = createClient(this.supabaseUrl, this.serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }
    return this.supabase;
  }

  constructor() {
    // Lazy initialization - credentials will be checked when methods are called
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    this.serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  }

  /**
   * Create a client-side Supabase client for use in browser
   */
  createClientSupabase(): SupabaseClient {
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!anonKey) {
      throw new Error('Supabase anon key not configured');
    }
    return createClient(this.supabaseUrl, anonKey);
  }

  /**
   * Request OTP code (primary authentication method)
   * Sends a 6-digit code to the user's email
   */
  async requestOTP(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = this.getSupabase();
      // Use Supabase Auth's signInWithOtp method
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // Auto-create user if doesn't exist
        }
      });

      if (error) {
        console.error('[AUTH] OTP request error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('[AUTH] OTP request exception:', error);
      return { success: false, error: error.message || 'Failed to send OTP' };
    }
  }

  /**
   * Verify OTP code (primary authentication method)
   * Returns user ID and creates a session if verification succeeds
   */
  async verifyOTP(email: string, code: string): Promise<{
    success: boolean;
    userId?: string;
    sessionToken?: string;
    error?: string;
  }> {
    try {
      const supabase = this.getSupabase();
      // Verify OTP with Supabase Auth
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email'
      });

      if (error) {
        console.error('[AUTH] OTP verification error:', error);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'User not found after OTP verification' };
      }

      const userId = data.user.id;

      // Ensure user profile exists
      await this.ensureUserProfile(data.user);

      // Generate session token
      const sessionToken = this.generateSessionToken();

      return {
        success: true,
        userId,
        sessionToken
      };
    } catch (error: any) {
      console.error('[AUTH] OTP verification exception:', error);
      return { success: false, error: error.message || 'Failed to verify OTP' };
    }
  }

  /**
   * Request magic link (backend available, not used by UI)
   * Sends a magic link to the user's email
   */
  async requestMagicLink(email: string, redirectTo?: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const supabase = this.getSupabase();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
          shouldCreateUser: true
        }
      });

      if (error) {
        console.error('[AUTH] Magic link request error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('[AUTH] Magic link request exception:', error);
      return { success: false, error: error.message || 'Failed to send magic link' };
    }
  }

  /**
   * Verify magic link token (backend available, not used by UI)
   * Returns user ID and creates a session if verification succeeds
   */
  async verifyMagicLink(token: string, hash: string): Promise<{
    success: boolean;
    userId?: string;
    sessionToken?: string;
    error?: string;
  }> {
    try {
      const supabase = this.getSupabase();
      // Verify the magic link token
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: hash,
        type: 'email'
      });

      if (error) {
        console.error('[AUTH] Magic link verification error:', error);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'User not found after magic link verification' };
      }

      const userId = data.user.id;

      // Ensure user profile exists
      await this.ensureUserProfile(data.user);

      // Generate session token
      const sessionToken = this.generateSessionToken();

      return {
        success: true,
        userId,
        sessionToken
      };
    } catch (error: any) {
      console.error('[AUTH] Magic link verification exception:', error);
      return { success: false, error: error.message || 'Failed to verify magic link' };
    }
  }

  /**
   * Get current user profile by user ID
   */
  async getCurrentUser(userId: string): Promise<UserProfile | null> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AUTH] Get user error:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error: any) {
      console.error('[AUTH] Get user exception:', error);
      return null;
    }
  }

  /**
   * Get user profile by email
   */
  async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('[AUTH] Get user by email error:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error: any) {
      console.error('[AUTH] Get user by email exception:', error);
      return null;
    }
  }

  /**
   * Get the first admin user from the database
   * Used by cron jobs to have a valid user context
   */
  async getFirstAdminUser(): Promise<UserProfile | null> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'admin')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('[AUTH] Get first admin user error:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error: any) {
      console.error('[AUTH] Get first admin user exception:', error);
      return null;
    }
  }

  /**
   * Update user's last active timestamp
   */
  async updateLastActive(userId: string): Promise<void> {
    try {
      const supabase = this.getSupabase();
      await supabase
        .from('user_profiles')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('[AUTH] Update last active error:', error);
      // Don't throw - this is a non-critical operation
    }
  }

  /**
   * Ensure user profile exists (creates if missing)
   */
  private async ensureUserProfile(user: any): Promise<void> {
    try {
      const supabase = this.getSupabase();
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existing) {
        // Create user profile
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email,
            role: 'user', // Default role
            preferences: {}
          });

        if (error) {
          console.error('[AUTH] Create user profile error:', error);
          // Don't throw - profile might be created by trigger
        }
      }
    } catch (error) {
      console.error('[AUTH] Ensure user profile exception:', error);
      // Don't throw - profile might be created by trigger
    }
  }

  /**
   * Generate a secure random session token
   */
  private generateSessionToken(): string {
    return randomBytes(32).toString('hex');
  }
}

// Export singleton instance
export const authService = new AuthService();

