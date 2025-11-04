# Session Management Phase 1: Database Migration Setup Guide

**Linear Issue**: AN-10  
**Phase**: 1 - Database Migration  
**Date**: 2025-01-27

## Overview

This guide walks you through implementing Phase 1 of the Session Management feature: Database migrations. This phase adds user authentication support and user-scoped data to the Agent Bio Summary V2 application.

## Prerequisites

1. Access to Supabase project with admin privileges
2. Supabase project URL and service role key
3. Understanding of the current database schema
4. **Backup your database** before running migrations (recommended)

## Step 1: Enable Supabase Authentication

Supabase Auth should already be enabled in your project. Verify and configure:

1. Go to **Supabase Dashboard** > **Authentication** > **Providers**
2. Ensure **Email** provider is enabled
3. Configure email templates if needed (for OTP codes)

### OTP Configuration (Primary Authentication Method)

1. Go to **Authentication** > **Providers** > **Email**
2. Enable **"Enable email provider"**
3. Configure email templates:
   - **OTP Template**: Customize the email template for OTP codes
   - OTP codes are 6-digit codes that expire after 10 minutes
   - Ensure email delivery is working (check Resend.io configuration)

### Magic Link (Backend Only - Not Used by UI)

- Magic link is automatically available when email auth is enabled
- No additional configuration needed
- Not exposed in the frontend UI (kept for potential future use)

## Step 2: Run Database Migration

1. Open **Supabase Dashboard** > **SQL Editor**
2. Copy the contents of `docs/SESSION-MANAGEMENT-MIGRATION-PHASE1.sql`
3. Paste into the SQL Editor
4. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

### What This Migration Does

- ✅ Creates `user_profiles` table (extends auth.users)
- ✅ Creates `user_sessions` table (tracks web UI sessions)
- ✅ Adds `user_id` column to existing tables:
  - `threads`
  - `system_settings`
  - `email_recipients`
  - `article_summaries`
  - `summary_evaluations`
- ✅ Creates necessary indexes for performance
- ✅ Creates triggers for auto-creating user profiles
- ✅ Updates unique constraints to include user_id
- ⏸️ **RLS policies are deferred** (optional - see Step 5)

### Important Changes

- **`threads.run_date`**: Changed from unique per date to unique per (user_id, run_date)
  - Multiple users can now have threads on the same date
- **`system_settings`**: Changed to unique per user_id
  - Each user now has their own settings

## Step 3: Migrate Existing Data (Optional)

If you have existing single-user data that needs to be migrated to a default user account:

1. **Create a default user account**:
   - Use Supabase Dashboard > Authentication > Users > Add User
   - Or use the API to create a user
   - Copy the user ID (UUID)

2. **Run data migration**:
   - Open `docs/SESSION-MANAGEMENT-DATA-MIGRATION.sql`
   - Replace `'YOUR_DEFAULT_USER_ID'` with the actual UUID
   - Run the migration script in Supabase SQL Editor

3. **Verify migration**:
   - The script includes verification queries
   - Check that all NULL user_ids have been migrated
   - Verify record counts per user

### If You Don't Have Existing Data

Skip this step. New users will be created automatically when they first log in.

## Step 4: Enable RLS (Optional - Recommended for Production)

**Note**: RLS (Row-Level Security) is optional for Phase 1. You can enable it later for additional database-level security.

### When to Enable RLS

- ✅ **Enable Now**: If you want defense-in-depth security from the start
- ⏸️ **Enable Later**: If you want to test functionality first, or if you're in development

### To Enable RLS Later

1. Open **Supabase Dashboard** > **SQL Editor**
2. Copy the contents of `docs/SESSION-MANAGEMENT-RLS-SETUP.sql`
3. Paste into the SQL Editor
4. Click **Run**

### Important Notes About RLS

- **Backend Operations**: Use `SUPABASE_SERVICE_ROLE_KEY` in your backend services - this bypasses RLS
- **Application-Level Security**: Still implement user_id filtering in your application code
- **Testing**: RLS can make debugging harder during development, which is why it's optional

### What RLS Provides

- Database-level security enforcement
- Prevents direct SQL access from bypassing application logic
- Defense-in-depth security layer
- Works automatically with Supabase Auth

## Step 5: Verify Migration

Run these verification queries in Supabase SQL Editor:

```sql
-- Check that tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_profiles', 'user_sessions');

-- Check that user_id columns were added
SELECT 
  table_name,
  column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'user_id'
  AND table_name IN ('threads', 'system_settings', 'email_recipients', 'article_summaries', 'summary_evaluations');

-- Check indexes
SELECT 
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE '%user_id%';

-- Check RLS status (optional - only if RLS was enabled)
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'user_sessions', 'threads', 'system_settings', 'email_recipients', 'article_summaries', 'summary_evaluations');

-- Check RLS policies (optional - only if RLS was enabled)
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'user_sessions', 'threads', 'system_settings', 'email_recipients', 'article_summaries', 'summary_evaluations');
```

Expected results:
- ✅ `user_profiles` and `user_sessions` tables exist
- ✅ All 5 tables have `user_id` column
- ✅ Indexes on `user_id` columns exist
- ⏸️ RLS policies (optional - only if you ran the RLS setup script)

## Step 5: Test Auto-Profile Creation

Test that user profiles are automatically created when a user signs up:

1. Create a test user via Supabase Auth API or Dashboard
2. Verify that a corresponding record exists in `user_profiles`:

```sql
SELECT * FROM user_profiles WHERE id = 'YOUR_TEST_USER_ID';
```

The profile should be created automatically via the trigger.

## Troubleshooting

### Error: "relation auth.users does not exist"

**Solution**: Supabase Auth might not be enabled. Go to Authentication > Settings and ensure email auth is enabled.

### Error: "constraint already exists" or "index already exists"

**Solution**: The migration uses `IF NOT EXISTS` clauses, but if you're re-running, you may need to drop existing constraints/indexes first. Check the migration script for drop statements.

### Error: "permission denied for schema auth"

**Solution**: Ensure you're using the service role key or have admin privileges in Supabase.

### RLS Policies Not Working (if RLS is enabled)

**Solution**: 
1. Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
2. Check policies: `SELECT * FROM pg_policies WHERE schemaname = 'public';`
3. Ensure you're using the service role key in backend (bypasses RLS)
4. If RLS is causing issues, you can disable it temporarily: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`
5. **Note**: If RLS is not enabled, this is expected - enable it using `SESSION-MANAGEMENT-RLS-SETUP.sql` when ready

### Data Migration Issues

**Solution**:
1. Verify the default user exists before running data migration
2. Check for foreign key constraints that might prevent migration
3. Run the verification queries to identify any NULL user_ids

## Next Steps

After completing Phase 1:

1. ✅ **Phase 1 Complete**: Database migrations are done
2. ➡️ **Phase 2**: Backend Implementation
   - Implement `AuthService.ts`
   - Implement `SessionService.ts`
   - Add authentication middleware
   - Update existing services to filter by user_id
3. ➡️ **Phase 3**: Frontend Implementation
   - Create login page (OTP flow)
   - Implement authentication hooks
   - Add AuthGuard component
   - Update existing pages

See `docs/SESSION-MANAGEMENT-DESIGN-SPEC.md` for the complete implementation plan.

## Rollback (If Needed)

If you need to rollback the migration:

1. **Disable RLS** (if RLS was enabled):
```sql
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_recipients DISABLE ROW LEVEL SECURITY;
ALTER TABLE article_summaries DISABLE ROW LEVEL SECURITY;
ALTER TABLE summary_evaluations DISABLE ROW LEVEL SECURITY;

-- Drop RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access to user_profiles" ON user_profiles;
-- (Repeat for other tables...)
```

2. **Remove user_id columns** (if needed):
```sql
ALTER TABLE threads DROP COLUMN IF EXISTS user_id;
ALTER TABLE system_settings DROP COLUMN IF EXISTS user_id;
ALTER TABLE email_recipients DROP COLUMN IF EXISTS user_id;
ALTER TABLE article_summaries DROP COLUMN IF EXISTS user_id;
ALTER TABLE summary_evaluations DROP COLUMN IF EXISTS user_id;
```

3. **Drop new tables** (if needed):
```sql
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
```

4. **Restore original constraints**:
```sql
-- Restore threads unique constraint
ALTER TABLE threads DROP CONSTRAINT IF EXISTS threads_user_run_date_key;
ALTER TABLE threads ADD CONSTRAINT threads_run_date_key UNIQUE (run_date);
```

**Note**: Rolling back will cause data loss if you've already migrated data. Always backup before migrations.

## Support

For issues or questions:
1. Check the design spec: `docs/SESSION-MANAGEMENT-DESIGN-SPEC.md`
2. Review the Linear issue: AN-10
3. Check Supabase logs for detailed error messages

