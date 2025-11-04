-- ============================================================================
-- Session Management RLS (Row-Level Security) Setup
-- ============================================================================
-- Linear Issue: AN-10
-- Phase: 1 (Optional) - RLS Policies
-- Date: 2025-01-27
--
-- This script enables Row-Level Security and creates policies for user isolation.
-- Run this AFTER completing the main Phase 1 migration.
--
-- IMPORTANT: Before enabling RLS, ensure:
-- 1. Phase 1 schema migration is complete
-- 2. Your backend services filter by user_id in application code
-- 3. You're using service role key for backend operations (bypasses RLS)
-- 4. You've tested that queries work correctly with RLS disabled
--
-- RLS provides an additional security layer at the database level.
-- Application-level authorization should still be implemented in the backend.
-- ============================================================================

-- ============================================================================
-- Enable RLS on All Tables
-- ============================================================================

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Service role has full access (for backend operations)
CREATE POLICY "Service role full access to user_profiles"
  ON user_profiles FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================

-- Enable RLS on user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role has full access (for backend operations)
CREATE POLICY "Service role full access to user_sessions"
  ON user_sessions FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================

-- Enable RLS on threads
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;

-- Users can view their own threads
CREATE POLICY "Users can view their own threads"
  ON threads FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own threads
CREATE POLICY "Users can insert their own threads"
  ON threads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own threads
CREATE POLICY "Users can update their own threads"
  ON threads FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role has full access (for backend operations)
CREATE POLICY "Service role full access to threads"
  ON threads FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================

-- Enable RLS on system_settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own settings
CREATE POLICY "Users can view their own settings"
  ON system_settings FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own settings
CREATE POLICY "Users can insert their own settings"
  ON system_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update their own settings"
  ON system_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role has full access (for backend operations)
CREATE POLICY "Service role full access to system_settings"
  ON system_settings FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================

-- Enable RLS on email_recipients
ALTER TABLE email_recipients ENABLE ROW LEVEL SECURITY;

-- Users can view their own recipients
CREATE POLICY "Users can view their own recipients"
  ON email_recipients FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own recipients
CREATE POLICY "Users can insert their own recipients"
  ON email_recipients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own recipients
CREATE POLICY "Users can update their own recipients"
  ON email_recipients FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own recipients
CREATE POLICY "Users can delete their own recipients"
  ON email_recipients FOR DELETE
  USING (auth.uid() = user_id);

-- Service role has full access (for backend operations)
CREATE POLICY "Service role full access to email_recipients"
  ON email_recipients FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================

-- Enable RLS on article_summaries
ALTER TABLE article_summaries ENABLE ROW LEVEL SECURITY;

-- Users can view their own summaries
CREATE POLICY "Users can view their own summaries"
  ON article_summaries FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own summaries
CREATE POLICY "Users can insert their own summaries"
  ON article_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role has full access (for backend operations)
CREATE POLICY "Service role full access to article_summaries"
  ON article_summaries FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================

-- Enable RLS on summary_evaluations
ALTER TABLE summary_evaluations ENABLE ROW LEVEL SECURITY;

-- Users can view evaluations for summaries they own
CREATE POLICY "Users can view evaluations for their summaries"
  ON summary_evaluations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM article_summaries
      WHERE article_summaries.id = summary_evaluations.summary_id
      AND article_summaries.user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- Users can insert evaluations for summaries they own
CREATE POLICY "Users can insert evaluations for their summaries"
  ON summary_evaluations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM article_summaries
      WHERE article_summaries.id = summary_evaluations.summary_id
      AND article_summaries.user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- Service role has full access (for backend operations)
CREATE POLICY "Service role full access to summary_evaluations"
  ON summary_evaluations FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- RLS Setup Complete
-- ============================================================================
--
-- Verify RLS is enabled:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
--   AND tablename IN ('user_profiles', 'user_sessions', 'threads', 'system_settings', 'email_recipients', 'article_summaries', 'summary_evaluations');
--
-- Verify policies exist:
-- SELECT schemaname, tablename, policyname 
-- FROM pg_policies 
-- WHERE schemaname = 'public';
--
-- ============================================================================

