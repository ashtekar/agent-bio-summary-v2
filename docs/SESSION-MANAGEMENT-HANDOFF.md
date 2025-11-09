# Session Management Implementation - Handoff Summary

**Linear Issue**: AN-10  
**Branch**: `ashtekar/an-10-session-management`  
**Date**: 2025-01-27  
**Status**: Phase 1 & 2 Complete, Phase 3 Pending

## Overview

This document provides a handoff summary for continuing work on Session Management (AN-10). Phase 1 (Database Migrations) and Phase 2 (Backend Implementation) are complete. Phase 3 (Frontend Implementation) is next.

## Completed Work

### Phase 1: Database Migrations ✅

**Files Created:**
- `docs/SESSION-MANAGEMENT-MIGRATION-PHASE1.sql` - Main schema migration
- `docs/SESSION-MANAGEMENT-DATA-MIGRATION.sql` - Data migration script (handles duplicate system_settings)
- `docs/SESSION-MANAGEMENT-RLS-SETUP.sql` - Optional RLS policies (deferred)
- `docs/SESSION-MANAGEMENT-PHASE1-SETUP.md` - Setup guide

**Key Changes:**
- Created `user_profiles` table (extends auth.users)
- Created `user_sessions` table (tracks web UI sessions)
- Added `user_id` column to: `threads`, `system_settings`, `email_recipients`, `article_summaries`, `summary_evaluations`
- Updated unique constraints to include `user_id`
- Auto-profile creation trigger
- **RLS is deferred** - can be enabled later using `SESSION-MANAGEMENT-RLS-SETUP.sql`

**Important Notes:**
- `system_settings` has unique constraint per user - data migration handles multiple rows by keeping most recent
- `threads` unique constraint changed from `(run_date)` to `(user_id, run_date)`
- Data migration script handles duplicate `system_settings` rows automatically

### Phase 2: Backend Implementation ✅

**New Services Created:**
- `src/services/AuthService.ts` - OTP and magic link authentication
  - `requestOTP(email)`, `verifyOTP(email, code)`
  - `requestMagicLink(email)` (backend only, not used by UI)
  - `getCurrentUser(userId)`, `updateLastActive(userId)`
- `src/services/SessionService.ts` - Session management
  - `createSession()`, `validateSession()`, `refreshSession()`, `revokeSession()`
  - `getUserActiveSessions()`, `cleanupExpiredSessions()`

**New Middleware:**
- `src/middleware/auth.ts`
  - `requireAuth(request)` - Returns `{ authorized, userId, response? }`
  - `requireAdmin(request)` - Returns `{ authorized, userId, isAdmin, response? }`
  - `getUserId(request)` - Optional user ID retrieval

**Updated Services (now user-scoped):**
- `src/services/SettingsService.ts` - All methods accept optional `userId` parameter
- `src/services/ThreadService.ts` - All methods require `userId` parameter
- `src/services/SummaryStorageService.ts` - Article summaries require `userId`
- `src/tools/ToolState.ts` - Session keys now include `userId` for isolation

**New API Routes:**
- `src/app/api/auth/route.ts`
  - `POST /api/auth` - OTP request/verify, magic link (backend only)
  - `GET /api/auth/me` - Get current user
  - `DELETE /api/auth/signout` - Sign out
- `src/app/api/auth/sessions/route.ts`
  - `GET /api/auth/sessions` - Get user's active sessions
  - `DELETE /api/auth/sessions` - Revoke sessions

**Updated API Routes (now require auth):**
- `src/app/api/settings/route.ts` - Requires auth, returns user role; POST/PUT require admin
- `src/app/api/threads/route.ts` - Requires auth, filters by user_id
- `src/app/api/daily-summary/route.ts` - Requires admin, passes userId to services

**Type Updates:**
- `src/types/agent.ts` - Added `userId: string` to `AgentContext`

**Settings Page Updates:**
- `src/app/settings/page.tsx` - Already updated with admin-only editing
  - Frontend disables all inputs for non-admin users
  - Shows "View Only (Admin Only)" badges
  - Backend enforces admin check on POST/PUT

## Current State

### Authentication Flow
- **OTP is primary method** (used by UI)
- Magic link backend exists but not exposed in UI
- Session tokens stored in HTTP-only cookies (7-day expiration)
- User profiles auto-created on first login

### Security
- **Backend enforcement**: All API routes require authentication
- **Admin enforcement**: Settings POST/PUT and daily-summary require admin
- **Frontend enforcement**: Settings page disables editing for non-admin users
- **RLS deferred**: Can be enabled later using separate SQL file

### User Roles
- Two roles: `'user'` (default) and `'admin'`
- Admin users can:
  - Execute "Run Now" (daily summary)
  - Modify settings
  - Manage recipients
- Regular users can:
  - View their own data (threads, summaries, settings)
  - Cannot trigger runs or modify settings

## Next Steps: Phase 3 - Frontend Implementation

### 1. Authentication Hook
**File**: `src/hooks/useAuth.ts`
- React hook for auth state
- Methods: `user`, `loading`, `signIn`, `signOut`, `isAdmin`
- Fetches user from `/api/auth/me`

### 2. Login Page
**File**: `src/app/login/page.tsx`
- OTP-only flow (email → send code → enter code → redirect)
- Single page handles entire flow
- Error handling and resend code option
- Redirects to dashboard on success

### 3. Authentication Components
- **`src/components/AuthGuard.tsx`** - Redirects to login if not authenticated
- **`src/components/AdminGuard.tsx`** - Protects admin-only features
- **`src/components/UserMenu.tsx`** - User profile dropdown with sign out

### 4. Update Existing Components
- **`src/components/Header.tsx`** - Add user menu, role badge, sign out button
- **`src/app/dashboard/page.tsx`** - Wrap with AuthGuard, show "Run Now" only for admins
- **`src/app/settings/page.tsx`** - Wrap with AuthGuard (admin checks already done)
- **`src/app/summaries/page.tsx`** - Wrap with AuthGuard
- **`src/app/evaluations/page.tsx`** - Wrap with AuthGuard (if exists)

### 5. Agent Updates
- **`src/agents/LangChainBioSummaryAgent.ts`** - Pass `userId` from context
- **`src/agents/LLMDrivenBioSummaryAgent.ts`** - Pass `userId` from context
- **`src/tools/LangChainTools.ts`** - Update `setToolSessionId`/`getToolSessionId` to include `userId`

## Key Implementation Details

### Session Token Storage
- Stored in HTTP-only cookie: `session_token`
- 7-day expiration
- Secure flag in production
- SameSite: 'lax'

### API Authentication Pattern
```typescript
// Standard auth check
const authResult = await requireAuth(request);
if (!authResult.authorized || !authResult.userId) {
  return authResult.response; // Returns 401
}

// Admin check
const adminResult = await requireAdmin(request);
if (!adminResult.authorized || !adminResult.isAdmin) {
  return adminResult.response; // Returns 401 or 403
}
```

### User ID Propagation
- Services accept `userId` parameter
- API routes extract `userId` from auth middleware
- Pass `userId` to all service calls
- Tool sessions use `userId:sessionId` as key format

### Settings Admin Protection
- **Frontend**: Disables all inputs, hides buttons, shows badges
- **Backend**: POST/PUT return 403 Forbidden for non-admin
- GET endpoint returns user role in response

## Testing Checklist (Phase 3)

- [ ] OTP flow works (request → email → verify → session)
- [ ] Login redirects to dashboard
- [ ] AuthGuard redirects unauthenticated users to login
- [ ] AdminGuard blocks non-admin users
- [ ] User menu shows correct role badge
- [ ] Sign out clears session
- [ ] Dashboard shows "Run Now" only for admins
- [ ] Settings page shows correct view/edit state
- [ ] All protected pages require authentication

## Database Status

✅ Phase 1 migrations ready to run
- Main migration: `docs/SESSION-MANAGEMENT-MIGRATION-PHASE1.sql`
- Data migration: `docs/SESSION-MANAGEMENT-DATA-MIGRATION.sql` (if needed)
- RLS setup: `docs/SESSION-MANAGEMENT-RLS-SETUP.sql` (optional, deferred)

## Environment Variables

No new environment variables needed. Uses existing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_BASE_URL`

## Important Notes

1. **OTP is primary** - Magic link exists in backend but UI only uses OTP
2. **RLS is optional** - Can be enabled later, not blocking
3. **Admin assignment** - Must be done manually in database (`UPDATE user_profiles SET role = 'admin'`)
4. **Data migration** - Handles duplicate `system_settings` rows automatically
5. **Session cleanup** - Should be run periodically (cron job or scheduled task)

## Files Modified/Created

### Created Files
- `src/services/AuthService.ts`
- `src/services/SessionService.ts`
- `src/middleware/auth.ts`
- `src/app/api/auth/route.ts`
- `src/app/api/auth/sessions/route.ts`
- `docs/SESSION-MANAGEMENT-MIGRATION-PHASE1.sql`
- `docs/SESSION-MANAGEMENT-DATA-MIGRATION.sql`
- `docs/SESSION-MANAGEMENT-RLS-SETUP.sql`
- `docs/SESSION-MANAGEMENT-PHASE1-SETUP.md`

### Modified Files
- `src/services/SettingsService.ts` - Added userId parameter
- `src/services/ThreadService.ts` - Added userId parameter
- `src/services/SummaryStorageService.ts` - Added userId parameter
- `src/tools/ToolState.ts` - User isolation with userId in keys
- `src/types/agent.ts` - Added userId to AgentContext
- `src/app/api/settings/route.ts` - Auth + admin checks
- `src/app/api/threads/route.ts` - Auth check
- `src/app/api/daily-summary/route.ts` - Admin check
- `src/app/settings/page.tsx` - Admin-only editing UI

## Design Spec Reference

Full design spec: `docs/SESSION-MANAGEMENT-DESIGN-SPEC.md`

## Next Conversation Start

When starting fresh, you can say:
> "I'm working on Linear issue AN-10: Session management. Phase 1 and 2 are complete. Continue with Phase 3: Frontend Implementation."

Or reference this file:
> "See SESSION-MANAGEMENT-HANDOFF.md for context. Continue with Phase 3."





