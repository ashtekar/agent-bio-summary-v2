import { NextRequest, NextResponse } from 'next/server';
import { sessionService } from '@/services/SessionService';
import { authService } from '@/services/AuthService';

/**
 * Authentication Middleware
 * 
 * Provides functions to protect API routes with authentication and authorization.
 */

export interface AuthResult {
  userId: string;
  isAdmin: boolean;
}

/**
 * Require authentication for an API route
 * Returns userId if authorized, or null if unauthorized
 */
export async function requireAuth(request: NextRequest): Promise<{
  authorized: boolean;
  userId?: string;
  response?: NextResponse;
}> {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Unauthorized: No session token' },
          { status: 401 }
        )
      };
    }

    // Validate session
    const validation = await sessionService.validateSession(sessionToken);

    if (!validation.valid || !validation.userId) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Unauthorized: Invalid or expired session' },
          { status: 401 }
        )
      };
    }

    // Update user's last active timestamp
    await authService.updateLastActive(validation.userId);

    return {
      authorized: true,
      userId: validation.userId
    };
  } catch (error: any) {
    console.error('[AUTH] requireAuth error:', error);
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Internal server error during authentication' },
        { status: 500 }
      )
    };
  }
}

/**
 * Require admin role for an API route
 * Returns userId if authorized as admin, or appropriate error response
 */
export async function requireAdmin(request: NextRequest): Promise<{
  authorized: boolean;
  userId?: string;
  isAdmin?: boolean;
  response?: NextResponse;
}> {
  try {
    // First check authentication
    const authResult = await requireAuth(request);

    if (!authResult.authorized || !authResult.userId) {
      return authResult as any;
    }

    const userId = authResult.userId;

    // Get user profile to check role
    const user = await authService.getCurrentUser(userId);

    if (!user) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'User profile not found' },
          { status: 404 }
        )
      };
    }

    if (user.role !== 'admin') {
      return {
        authorized: false,
        isAdmin: false,
        response: NextResponse.json(
          { error: 'Forbidden: Admin access required' },
          { status: 403 }
        )
      };
    }

    return {
      authorized: true,
      userId,
      isAdmin: true
    };
  } catch (error: any) {
    console.error('[AUTH] requireAdmin error:', error);
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Internal server error during authorization' },
        { status: 500 }
      )
    };
  }
}

/**
 * Get user ID from request (optional - doesn't return error if not authenticated)
 * Useful for routes that work for both authenticated and unauthenticated users
 */
export async function getUserId(request: NextRequest): Promise<string | null> {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    if (!sessionToken) {
      return null;
    }

    const validation = await sessionService.validateSession(sessionToken);
    if (!validation.valid || !validation.userId) {
      return null;
    }

    return validation.userId;
  } catch (error) {
    console.error('[AUTH] getUserId error:', error);
    return null;
  }
}

