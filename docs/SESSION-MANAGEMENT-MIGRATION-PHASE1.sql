-- ============================================================================
-- Session Management Migration - Phase 1: Database Schema
-- ============================================================================
-- Linear Issue: AN-10
-- Phase: 1 - Database Migration
-- Date: 2025-01-27
--
-- This migration adds user authentication and session management to the
-- Agent Bio Summary V2 application.
--
-- IMPORTANT: This is a breaking change that requires:
-- 1. Supabase Auth to be enabled
-- 2. All existing data to be migrated to a default user (if applicable)
-- 3. All API routes will require authentication after this implementation
-- ============================================================================

-- ============================================================================
-- STEP 1: Enable Supabase Authentication
-- ============================================================================
-- Note: Supabase Auth is enabled by default in Supabase projects.
-- If not enabled, go to Authentication > Settings in Supabase dashboard
-- and enable "Enable Email Auth".
--
-- For OTP authentication:
-- 1. Go to Authentication > Providers > Email
-- 2. Enable "Enable email provider"
-- 3. Configure email templates for OTP codes
--
-- For magic link (backend only, not used by UI):
-- - Magic link is automatically available when email auth is enabled
-- ============================================================================

-- ============================================================================
-- STEP 2: Create User Profiles Table
-- ============================================================================
-- Extends Supabase auth.users with additional metadata
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
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

-- Indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- ============================================================================
-- STEP 3: Create User Sessions Table
-- ============================================================================
-- Track active web UI sessions with expiration
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
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

-- Indexes for user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(active) WHERE active = true;

-- ============================================================================
-- STEP 4: Add User Context to Existing Tables
-- ============================================================================

-- 4.1: Add user_id to threads table
ALTER TABLE threads 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_threads_user_id ON threads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_user_date ON threads(user_id, run_date DESC);

-- Note: The unique constraint on run_date needs to be updated to allow
-- multiple users to have threads on the same date.
-- First, drop the existing unique constraint if it exists
ALTER TABLE threads DROP CONSTRAINT IF EXISTS threads_run_date_key;

-- Add new unique constraint that includes user_id
ALTER TABLE threads 
  ADD CONSTRAINT threads_user_run_date_key UNIQUE (user_id, run_date);

-- 4.2: Add user_id to system_settings table
ALTER TABLE system_settings 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_system_settings_user_id ON system_settings(user_id);

-- Update unique constraint to include user_id
-- First, drop existing constraint if it exists
ALTER TABLE system_settings DROP CONSTRAINT IF EXISTS system_settings_unique;
ALTER TABLE system_settings 
  ADD CONSTRAINT system_settings_unique UNIQUE (user_id);

-- 4.3: Add user_id to email_recipients table
ALTER TABLE email_recipients 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_email_recipients_user_id ON email_recipients(user_id);

-- 4.4: Add user_id to article_summaries table
ALTER TABLE article_summaries 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_article_summaries_user_id ON article_summaries(user_id);

-- 4.5: Add user_id to summary_evaluations table
-- Note: ON DELETE SET NULL because evaluations might outlive user accounts
ALTER TABLE summary_evaluations 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_summary_evaluations_user_id ON summary_evaluations(user_id);

-- ============================================================================
-- STEP 5: Row-Level Security (RLS) Policies
-- ============================================================================
-- NOTE: RLS is OPTIONAL for Phase 1. You can enable it later.
-- See: docs/SESSION-MANAGEMENT-RLS-SETUP.sql for RLS implementation
-- 
-- For now, RLS is commented out to allow easier development and testing.
-- Application-level authorization should still be implemented in the backend.
-- 
-- To enable RLS later, run: docs/SESSION-MANAGEMENT-RLS-SETUP.sql
-- ============================================================================

-- RLS is deferred to a separate migration file
-- Uncomment the section below if you want to enable RLS now:
--
-- Enable RLS on user_profiles
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- 
-- Users can view their own profile
-- CREATE POLICY "Users can view their own profile"
--   ON user_profiles FOR SELECT
--   USING (auth.uid() = id);
-- 
-- Users can update their own profile
-- CREATE POLICY "Users can update their own profile"
--   ON user_profiles FOR UPDATE
--   USING (auth.uid() = id);
-- 
-- Service role has full access
-- CREATE POLICY "Service role full access to user_profiles"
--   ON user_profiles FOR ALL
--   USING (auth.role() = 'service_role');
--
-- (See SESSION-MANAGEMENT-RLS-SETUP.sql for complete RLS policies)

-- ============================================================================
-- STEP 6: Create Function to Auto-Create User Profile
-- ============================================================================
-- This function automatically creates a user_profile when a new user signs up
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 7: Create Function to Update Updated_At Timestamp
-- ============================================================================
-- Automatically update updated_at timestamp on user_profiles
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- 
-- Next Steps:
-- 1. Run data migration script (if you have existing single-user data)
--    See: docs/SESSION-MANAGEMENT-DATA-MIGRATION.sql
-- 2. Enable RLS (optional - recommended for production)
--    See: docs/SESSION-MANAGEMENT-RLS-SETUP.sql
-- 3. Proceed to Phase 2: Backend Implementation
--    See: docs/SESSION-MANAGEMENT-DESIGN-SPEC.md
-- ============================================================================

