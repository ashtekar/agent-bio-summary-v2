'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'user' | 'admin';
  preferences: Record<string, any>;
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  signIn: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  requestOTP: (email: string) => Promise<{ success: boolean; error?: string }>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check authentication status on mount and when needed
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth');
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Request OTP code
  const requestOTP = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'otp',
          email
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to send OTP' };
      }
    } catch (error) {
      console.error('OTP request failed:', error);
      return { success: false, error: 'Network error' };
    }
  }, []);

  // Sign in with OTP code
  const signIn = useCallback(async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email,
          code
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh user data
        await checkAuth();
        // Redirect to dashboard
        router.push('/dashboard');
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to verify OTP' };
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      return { success: false, error: 'Network error' };
    }
  }, [checkAuth, router]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'DELETE'
      });
      
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
      // Still clear user and redirect on error
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  return {
    user,
    loading,
    signIn,
    signOut,
    isAdmin: user?.role === 'admin',
    requestOTP
  };
}

