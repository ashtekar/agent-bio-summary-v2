import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth';
import { sessionService } from '@/services/SessionService';

/**
 * GET /api/auth/sessions - Get user's active sessions
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (!authResult.authorized || !authResult.userId) {
      return authResult.response || NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const sessions = await sessionService.getUserActiveSessions(authResult.userId);

    return NextResponse.json({
      sessions: sessions.map(session => ({
        id: session.id,
        created_at: session.created_at,
        last_activity: session.last_activity,
        expires_at: session.expires_at,
        ip_address: session.ip_address,
        user_agent: session.user_agent
      }))
    });

  } catch (error: any) {
    console.error('[AUTH SESSIONS API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/sessions - Revoke a session or all sessions
 */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (!authResult.authorized || !authResult.userId) {
      return authResult.response || NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { sessionId } = body;

    if (sessionId) {
      // Revoke specific session
      const success = await sessionService.revokeSession(sessionId);
      return NextResponse.json({
        success,
        message: success ? 'Session revoked' : 'Failed to revoke session'
      });
    } else {
      // Revoke all sessions for user
      const success = await sessionService.revokeAllUserSessions(authResult.userId);
      return NextResponse.json({
        success,
        message: success ? 'All sessions revoked' : 'Failed to revoke sessions'
      });
    }

  } catch (error: any) {
    console.error('[AUTH SESSIONS API] DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

