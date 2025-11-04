# Session Management Design Specification

**Linear Issue**: AN-10  
**Status**: Design Spec  
**Date**: 2025-01-27

## Overview

This design specifies the implementation of comprehensive session management for the Agent Bio Summary V2 application, including user authentication, login sessions, web UI session tracking, and multi-user support with session isolation.

## Goals

1. **User Authentication**: Add secure user login/logout functionality using Supabase Auth
2. **Web UI Sessions**: Track and manage browser sessions for dashboard users
3. **Multi-User Support**: Enable multiple users with isolated data and tool execution sessions
4. **Session Isolation**: Ensure tool execution sessions are isolated per user

## Architecture Overview

### Current State
- No user authentication system
- Single-tenant architecture (shared settings)
- In-memory tool session management (`ToolStateManager`)
- Threads stored in database but not user-scoped

### Target State
- Multi-user authentication via Supabase Auth
- User-scoped settings, threads, and summaries
- Isolated tool execution sessions per user
- Web UI session tracking with expiration
- Role-based access control (future-ready)

## Database Schema Changes

### 1. Enable Supabase Auth
- Configure Supabase Authentication
- One-time passcode (OTP) authentication (primary, UI-only)
- Magic link authentication (backend available, hidden from UI for future use)
- No password storage required
- Users authenticate via OTP code sent to email
- Magic link infrastructure kept in backend but not exposed to users

### 2. Users Table Extension
```sql
-- Extends Supabase auth.users with additional metadata
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE,
  preferences JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT user_profiles_email_key UNIQUE (email)
);

CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
```

### 3. User Sessions Table
```sql
-- Track active web UI sessions
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  active BOOLEAN DEFAULT true,
  
  CONSTRAINT user_sessions_token_key UNIQUE (session_token)
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_active ON user_sessions(active) WHERE active = true;
```

### 4. Update Existing Tables with User Context

**threads table:**
```sql
ALTER TABLE threads ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX idx_threads_user_id ON threads(user_id);
CREATE INDEX idx_threads_user_date ON threads(user_id, run_date DESC);
```

**system_settings table:**
```sql
ALTER TABLE system_settings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX idx_system_settings_user_id ON system_settings(user_id);
-- Update unique constraint to include user_id
ALTER TABLE system_settings DROP CONSTRAINT IF EXISTS system_settings_unique;
ALTER TABLE system_settings ADD CONSTRAINT system_settings_unique UNIQUE (user_id);
```

**email_recipients table:**
```sql
ALTER TABLE email_recipients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX idx_email_recipients_user_id ON email_recipients(user_id);
```

**article_summaries table:**
```sql
ALTER TABLE article_summaries ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX idx_article_summaries_user_id ON article_summaries(user_id);
```

**summary_evaluations table:**
```sql
-- Already has grader_email, but add user_id for the evaluation owner
ALTER TABLE summary_evaluations ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX idx_summary_evaluations_user_id ON summary_evaluations(user_id);
```

## Tool Session Management Enhancements

### Enhanced ToolStateManager

**File: `src/tools/ToolState.ts`**

Key changes:
- Add `userId` to session keys for isolation
- Track session timestamps for cleanup
- Add methods to get/clear user-specific sessions
- Implement automatic cleanup of expired sessions

```typescript
interface ToolState {
  userId: string;  // NEW: User ID for isolation
  searchResults?: any[];
  extractedArticles?: any[];
  // ... existing fields
}

class ToolStateManager {
  private state: Map<string, ToolState> = new Map();
  private sessionTimestamps: Map<string, { createdAt: Date; lastAccess: Date }> = new Map();
  
  // NEW: Get state scoped to user
  getState(sessionId: string, userId: string): ToolState {
    const key = `${userId}:${sessionId}`;
    // Implementation details...
  }
  
  // NEW: Cleanup expired sessions (older than 1 hour)
  cleanup(ttlMinutes: number = 60): void {
    // Implementation details...
  }
  
  // NEW: Get sessions for a specific user
  getUserSessions(userId: string): string[] {
    // Implementation details...
  }
  
  // NEW: Clear all sessions for a user
  clearUserSessions(userId: string): void {
    // Implementation details...
  }
}
```

## Authentication Service

### New File: `src/services/AuthService.ts`

Provides:
- Passwordless authentication via magic link or OTP
- Session creation and validation
- User profile management
- Server-side and client-side Supabase clients

Key methods:
- `requestOTP(email)` - Send OTP code to email (primary, used by UI)
- `verifyOTP(email, code)` - Verify OTP code entered by user (primary, used by UI)
- `requestMagicLink(email)` - Send magic link to email (backend available, not used by UI)
- `verifyMagicLink(token)` - Verify magic link token from email (backend available, not used by UI)
- `signOut()`
- `getCurrentUser()`
- `createUserSession(userId, ipAddress, userAgent)`
- `validateSession(sessionToken)`
- `refreshSession(sessionToken)`
- `revokeSession(sessionToken)`
- `getUserSessions(userId)`

**Note**: 
- OTP is the primary authentication method exposed in the UI
- Magic link methods are implemented in backend for potential future use
- Supabase Auth supports both natively. For OTP, we'll use Supabase's built-in OTP feature or custom implementation if needed

## Session Management Service

### New File: `src/services/SessionService.ts`

Provides:
- Session CRUD operations
- Session validation and refresh
- Expired session cleanup
- Active session queries

Key methods:
- `createSession(userId, metadata)`
- `validateSession(sessionToken)`
- `refreshSession(sessionToken)`
- `revokeSession(sessionToken)`
- `cleanupExpiredSessions()`
- `getUserActiveSessions(userId)`

## API Route Changes

### Authentication Middleware

**New File: `src/middleware/auth.ts`**

```typescript
export async function requireAuth(request: NextRequest) {
  // Validates session token from cookies
  // Returns userId if authorized
  // Returns 401 response if unauthorized
}

export async function requireAdmin(request: NextRequest) {
  // Validates session token and checks if user has admin role
  // Returns userId if authorized as admin
  // Returns 403 response if not admin
  // Returns 401 response if not authenticated
}
```

### Updated Routes

**`src/app/api/daily-summary/route.ts`**
- Add authentication check
- Add admin role check (only admins can execute Run Now)
- Return 403 Forbidden if non-admin attempts to execute
- Extract `userId` from session
- Pass `userId` to agent context
- Create user-scoped threads

**`src/app/api/settings/route.ts`**
- Add authentication check
- Filter settings by `user_id`
- Create/update user-specific settings

**`src/app/api/threads/route.ts`**
- Add authentication check
- Filter threads by `user_id`

**New Route: `src/app/api/auth/route.ts`**
- `POST /api/auth/otp` - Request OTP code (primary method, used by UI)
- `POST /api/auth/magic-link` - Request magic link (backend available, not used by UI)
- `POST /api/auth/verify` - Verify OTP code (primary) or magic link token (backend only)
- `POST /api/auth/signout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/auth/sessions` - Get user's active sessions

**Note**: Magic link endpoints are implemented but not called from frontend. They remain available for future use.

## Frontend Changes

### Authentication Pages

**New File: `src/app/login/page.tsx`**
- Login form (email only)
- OTP-only flow (no UI choice between methods)
- Flow: Enter email → Click "Send Code" → Enter 6-digit code from email → Redirect to dashboard
- Automatic user creation on first login (no separate signup needed)
- Single page handles OTP flow

**OTP Implementation (UI):**
- User enters email → API sends 6-digit code via email
- User enters code on same page → Code verified → Session created → Redirect to dashboard
- Clear error messages for expired/invalid codes
- Resend code option (with rate limiting)

**Magic Link Implementation (Backend Only - Not Exposed):**
- Backend infrastructure kept intact for potential future use
- Magic link endpoints remain available in API but not used by frontend
- Can be enabled later by updating frontend without backend changes

### Authentication Components

**New File: `src/components/AuthGuard.tsx`**
- Wrapper component that redirects to login if not authenticated
- Protects routes that require authentication

**New File: `src/components/AdminGuard.tsx`**
- Wrapper component that checks user role
- Redirects to dashboard or shows error if user is not admin
- Used to protect admin-only features

**New File: `src/components/UserMenu.tsx`**
- User profile dropdown
- Active sessions management
- Sign out button

### Updated Components

**`src/components/Header.tsx`**
- Add user menu
- Show user name/email and role badge (Admin/User)
- Sign out button

**`src/app/dashboard/page.tsx`**
- Wrap with AuthGuard
- Load user-specific data
- Conditionally show "Run Now" button only for admin users
- Hide "Run Now" button for non-admin users
- Display appropriate message for non-admin users (e.g., "Contact admin to run summary")

**`src/app/settings/page.tsx`**
- Wrap with AuthGuard
- Load/save user-specific settings

### Authentication Hook

**New File: `src/hooks/useAuth.ts`**
- React hook for authentication state
- Provides: `user`, `loading`, `signIn`, `signOut`, `refreshSession`
- Provides: `isAdmin` - boolean indicating if user has admin role
- Manages client-side auth state
- Checks user role from profile

## Agent Context Updates

**`src/types/agent.ts`**
```typescript
export interface AgentContext {
  userId: string;  // NEW: User ID for isolation
  threadId?: string;
  // ... existing fields
}
```

**`src/agents/LangChainBioSummaryAgent.ts`**
- Accept `userId` in context
- Pass `userId` to `setToolSessionId` for isolated sessions
- Create user-scoped threads

**`src/tools/LangChainTools.ts`**
- Update `setToolSessionId` to include `userId`
- Update `getToolSessionId` to require `userId`

## Migration Strategy

### Phase 1: Database Migration
1. Enable Supabase Auth
2. Create new tables (user_profiles, user_sessions)
3. Add `user_id` columns to existing tables
4. Migrate existing data to default user (if single user exists)

### Phase 2: Backend Implementation
1. Implement AuthService
2. Implement SessionService
3. Add authentication middleware
4. Update existing services to filter by user_id
5. Update tool session management

### Phase 3: Frontend Implementation
1. Create login page with magic link and OTP options
2. Create magic link verification page
3. Implement authentication hooks
4. Add AuthGuard component
5. Update existing pages to require auth
6. Add user menu and session management UI

### Phase 4: Testing & Validation
1. Test multi-user isolation
2. Test session expiration
3. Test concurrent sessions
4. Validate data access controls

## Security Considerations

1. **Session Tokens**: Use secure, random tokens (UUID v4)
2. **Session Expiration**: Default 7 days, configurable per user
3. **Magic Link Security**: 
   - Links expire after 1 year (configurable)
   - Single-use tokens (invalidated after use)
   - Include secure random token in link
   - HTTPS required for link delivery
4. **OTP Security**:
   - 6-digit codes, expire after 10 minutes
   - Rate limiting: Max 3 attempts per email per hour
   - Codes are single-use
   - Case-insensitive code entry
5. **CSRF Protection**: Use SameSite cookies
6. **Rate Limiting**: Limit magic link/OTP requests per IP (max 5 per hour per email)
7. **Row-Level Security**: Implement RLS policies in Supabase
8. **Session Validation**: Validate on every authenticated request
9. **Email Verification**: No separate email verification needed - magic link/OTP serves as verification
10. **No Password Storage**: Eliminates password-related security risks (brute force, credential stuffing, etc.)
11. **Role-Based Access Control**:
    - Admin role stored in `user_profiles.role` field
    - Backend enforces admin check for protected endpoints
    - Frontend conditionally renders admin-only features
    - Default role is 'user' for new users (admins must be manually promoted)
    - Failed admin access attempts logged for security monitoring

## Row-Level Security Policies

```sql
-- RLS for threads
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own threads"
  ON threads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own threads"
  ON threads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Similar policies needed for:
-- system_settings, email_recipients, article_summaries, summary_evaluations
```

## Session Lifecycle

1. **Login (Magic Link)**: User enters email → Magic link sent → User clicks link → Token verified → Session created → Token stored in cookie
2. **Login (OTP)**: User enters email → OTP code sent → User enters code → Code verified → Session created → Token stored in cookie
3. **Active Use**: Session validated on each request → `last_activity` updated
4. **Idle Timeout**: Sessions expire after inactivity (configurable, default 7 days)
5. **Logout**: Session revoked → Token invalidated
6. **Cleanup**: Background job removes expired sessions daily

## Configuration

**Environment Variables:**
```bash
# Session Configuration
SESSION_DURATION_DAYS=7
SESSION_IDLE_TIMEOUT_MINUTES=30
SESSION_CLEANUP_INTERVAL_HOURS=24
MAX_CONCURRENT_SESSIONS=5

# Authentication Configuration
MAGIC_LINK_EXPIRY_MINUTES=60
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6
MAX_OTP_ATTEMPTS=3
RATE_LIMIT_REQUESTS_PER_HOUR=5
```

## Monitoring & Observability

1. **Session Metrics**: Track active sessions, logins, logouts
2. **Security Events**: Log failed authentication attempts
3. **User Activity**: Track last active timestamps
4. **Session Analytics**: Monitor session duration, concurrent sessions

## Future Enhancements

1. OAuth providers (Google, GitHub)
2. Remember me functionality (extended session duration)
3. Role-based access control (admin/user) - **PARTIALLY IMPLEMENTED**: Admin-only Run Now feature
4. Session management dashboard for admins
5. Audit logs for security events
6. SMS OTP as alternative to email OTP
7. Biometric authentication (device-level)

## Implementation Checklist

### Database Setup
- [ ] Enable Supabase Authentication
- [ ] Create `user_profiles` table
- [ ] Create `user_sessions` table
- [ ] Add `user_id` column to `threads` table
- [ ] Add `user_id` column to `system_settings` table
- [ ] Add `user_id` column to `email_recipients` table
- [ ] Add `user_id` column to `article_summaries` table
- [ ] Add `user_id` column to `summary_evaluations` table
- [ ] Create all necessary indexes
- [ ] Set up Row-Level Security policies

### Backend Services
- [ ] Implement `AuthService.ts`
- [ ] Implement `SessionService.ts`
- [ ] Create authentication middleware (`middleware/auth.ts`)
- [ ] Add `requireAdmin()` function to middleware for role-based access control
- [ ] Update `ToolStateManager` for user isolation
- [ ] Update `SettingsService` to filter by user_id
- [ ] Update `ThreadService` to filter by user_id
- [ ] Update `SummaryStorageService` to filter by user_id

### API Routes
- [ ] Create `/api/auth/route.ts` with otp/verify/signout endpoints (primary)
- [ ] Implement magic-link endpoints (backend only, not used by UI)
- [ ] Update `/api/daily-summary/route.ts` with auth and admin check
- [ ] Update `/api/settings/route.ts` with auth
- [ ] Update `/api/threads/route.ts` with auth
- [ ] Update `/api/summaries/route.ts` with auth

### Frontend Pages
- [ ] Create `/app/login/page.tsx` (OTP-only flow, no UI choice)
- [ ] Note: Magic link verification handler not needed for OTP-only UI
- [ ] Update `/app/dashboard/page.tsx` with AuthGuard
- [ ] Update `/app/settings/page.tsx` with AuthGuard
- [ ] Update `/app/summaries/page.tsx` with AuthGuard

### Frontend Components
- [ ] Create `components/AuthGuard.tsx`
- [ ] Create `components/AdminGuard.tsx` (optional, for admin-only pages)
- [ ] Create `components/UserMenu.tsx`
- [ ] Update `components/Header.tsx` with user menu
- [ ] Create `hooks/useAuth.ts` with `isAdmin` check

### Agent Updates
- [ ] Update `AgentContext` type with userId
- [ ] Update `LangChainBioSummaryAgent` to use userId
- [ ] Update `LLMDrivenBioSummaryAgent` to use userId
- [ ] Update `LangChainTools.ts` for user-scoped sessions

### Testing
- [ ] Test OTP flow (request → email delivery → code verification) - Primary flow
- [ ] Test magic link endpoints (backend verification, not UI-driven)
- [ ] Test user login/logout flow
- [ ] Test OTP expiration and rate limiting (primary)
- [ ] Test magic link expiration (backend verification only)
- [ ] Test session expiration
- [ ] Test multi-user data isolation
- [ ] Test concurrent sessions
- [ ] Test tool session isolation per user
- [ ] Test RLS policies enforcement
- [ ] Test admin role enforcement on daily-summary endpoint (403 for non-admin)
- [ ] Test "Run Now" button visibility for admin vs non-admin users
- [ ] Test admin role check in middleware

## Notes

- This is a breaking change that requires database migration
- Existing single-user data will need migration to a default user account
- All API routes will require authentication after this implementation
- Tool session management changes from global to user-scoped
- Passwordless authentication eliminates password management complexity
- OTP is the primary authentication method (UI only supports OTP)
- Magic link backend infrastructure maintained for potential future use
- Email service configuration required (Resend.io already configured)
- OTP codes should be stored temporarily with expiration timestamps
- First-time users are automatically created when they verify their email via OTP
- Admin users must be manually assigned via database (role = 'admin' in user_profiles table)
- Run Now feature is restricted to admin users only (both frontend UI and backend API)
- Non-admin users can still view their own summaries and settings, but cannot trigger new runs
- To enable magic link in future: Update frontend to call magic-link endpoints, no backend changes needed
