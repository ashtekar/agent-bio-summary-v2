import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/AuthService';
import { sessionService } from '@/services/SessionService';

/**
 * Authentication API Routes
 * 
 * Handles OTP authentication (primary) and magic link (backend only)
 */

/**
 * POST /api/auth/otp - Request OTP code
 * Primary authentication method used by UI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, code, token, hash } = body;

    // Request OTP
    if (action === 'otp' && email && !code) {
      const result = await authService.requestOTP(email);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to send OTP' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'OTP code sent to email'
      });
    }

    // Verify OTP
    if (action === 'verify' && email && code) {
      const result = await authService.verifyOTP(email, code);

      if (!result.success || !result.userId || !result.sessionToken) {
        return NextResponse.json(
          { error: result.error || 'Failed to verify OTP' },
          { status: 401 }
        );
      }

      // Create session
      const ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';

      const session = await sessionService.createSession({
        userId: result.userId,
        ipAddress,
        userAgent,
        expiresInDays: 7
      });

      if (!session) {
        return NextResponse.json(
          { error: 'Failed to create session' },
          { status: 500 }
        );
      }

      // Set session cookie
      const response = NextResponse.json({
        success: true,
        user: {
          id: result.userId,
          email
        }
      });

      response.cookies.set('session_token', session.session_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return response;
    }

    // Request magic link (backend only, not used by UI)
    if (action === 'magic-link' && email) {
      const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`;
      const result = await authService.requestMagicLink(email, redirectTo);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to send magic link' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Magic link sent to email'
      });
    }

    // Verify magic link (backend only, not used by UI)
    if (action === 'magic-link-verify' && token && hash) {
      const result = await authService.verifyMagicLink(token, hash);

      if (!result.success || !result.userId || !result.sessionToken) {
        return NextResponse.json(
          { error: result.error || 'Failed to verify magic link' },
          { status: 401 }
        );
      }

      // Create session
      const ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';

      const session = await sessionService.createSession({
        userId: result.userId,
        ipAddress,
        userAgent,
        expiresInDays: 7
      });

      if (!session) {
        return NextResponse.json(
          { error: 'Failed to create session' },
          { status: 500 }
        );
      }

      // Set session cookie
      const response = NextResponse.json({
        success: true,
        user: {
          id: result.userId
        }
      });

      response.cookies.set('session_token', session.session_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('[AUTH API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/me - Get current user
 */
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const validation = await sessionService.validateSession(sessionToken);

    if (!validation.valid || !validation.userId) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const user = await authService.getCurrentUser(validation.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferences: user.preferences
      }
    });

  } catch (error: any) {
    console.error('[AUTH API] GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/signout - Sign out current user
 */
export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (sessionToken) {
      await sessionService.revokeSession(sessionToken);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully'
    });

    // Clear session cookie
    response.cookies.delete('session_token');

    return response;

  } catch (error: any) {
    console.error('[AUTH API] DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

