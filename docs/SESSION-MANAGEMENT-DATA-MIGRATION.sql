-- ============================================================================
-- Session Management Data Migration - Phase 1: Migrate Existing Data
-- ============================================================================
-- Linear Issue: AN-10
-- Phase: 1 - Database Migration
-- Date: 2025-01-27
--
-- This script migrates existing single-user data to a default user account.
-- IMPORTANT: This should only be run if you have existing data that needs
-- to be migrated to a specific user account.
--
-- Special Handling for system_settings:
-- - The SettingsService inserts new records instead of updating, which may
--   result in multiple rows with NULL user_id
-- - Since system_settings has UNIQUE(user_id) constraint, this script will:
--   1. Keep only the most recent row (by updated_at/created_at)
--   2. Delete all other duplicate rows
-- - This ensures only one row per user, maintaining data integrity
--
-- Prerequisites:
-- 1. Phase 1 schema migration has been completed
-- 2. You have created a default user account (or will create one)
-- 3. You have the user ID (UUID) of the default user
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Default User (if needed)
-- ============================================================================
-- If you don't have a default user yet, you can create one via Supabase Auth
-- or manually insert into auth.users (not recommended - use Supabase Auth).
--
-- To create via Supabase Auth:
-- 1. Use Supabase Dashboard > Authentication > Users > Add User
-- 2. Or use the API to create a user
-- 3. Copy the user ID (UUID) for use in the migration below
--
-- Replace 'YOUR_DEFAULT_USER_ID' with the actual UUID of your default user
-- ============================================================================

-- ============================================================================
-- STEP 2: Migrate Existing Data to Default User
-- ============================================================================
-- Replace 'YOUR_DEFAULT_USER_ID' with the actual UUID of your default user
-- ============================================================================

DO $$
DECLARE
  default_user_id UUID := '333f739d-3cdb-4a85-834b-fc3ea6b9b5da'::UUID; -- REPLACE THIS
  settings_count INTEGER;
BEGIN
  -- Check if default user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = default_user_id) THEN
    RAISE EXCEPTION 'Default user with ID % does not exist. Please create a user first or update the default_user_id variable.', default_user_id;
  END IF;

  -- Check for duplicate system_settings before migration
  SELECT COUNT(*) INTO settings_count
  FROM system_settings
  WHERE user_id IS NULL;
  
  IF settings_count > 1 THEN
    RAISE NOTICE 'Found % system_settings rows with NULL user_id. Will keep only the most recent one and delete the rest.', settings_count;
  END IF;

  -- Migrate threads (if user_id is NULL)
  UPDATE threads
  SET user_id = default_user_id
  WHERE user_id IS NULL;

  -- Migrate system_settings (if user_id is NULL)
  -- NOTE: system_settings has UNIQUE(user_id) constraint, so we need to handle multiple rows
  -- Strategy: Keep only the most recent row and delete the rest
  IF settings_count > 0 THEN
    -- Update the most recent row to the default user
    WITH most_recent_settings AS (
      SELECT id
      FROM system_settings
      WHERE user_id IS NULL
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST
      LIMIT 1
    )
    UPDATE system_settings
    SET user_id = default_user_id
    WHERE id IN (SELECT id FROM most_recent_settings);
    
    -- Delete duplicate system_settings rows (keep only the one we just migrated)
    DELETE FROM system_settings
    WHERE user_id IS NULL;
    
    IF settings_count > 1 THEN
      RAISE NOTICE 'Migrated system_settings: kept most recent row, deleted % duplicate(s)', settings_count - 1;
    ELSE
      RAISE NOTICE 'Migrated system_settings: migrated 1 row';
    END IF;
  END IF;

  -- Migrate email_recipients (if user_id is NULL)
  UPDATE email_recipients
  SET user_id = default_user_id
  WHERE user_id IS NULL;

  -- Migrate article_summaries (if user_id is NULL)
  UPDATE article_summaries
  SET user_id = default_user_id
  WHERE user_id IS NULL;

  -- Migrate summary_evaluations (if user_id is NULL)
  -- Note: summary_evaluations.user_id is optional (ON DELETE SET NULL)
  -- but we can still migrate existing data
  UPDATE summary_evaluations
  SET user_id = default_user_id
  WHERE user_id IS NULL;

  RAISE NOTICE 'Migration completed successfully. All data migrated to user: %', default_user_id;
END $$;

-- ============================================================================
-- STEP 3: Verify Migration
-- ============================================================================
-- Run these queries to verify that data has been migrated correctly
-- ============================================================================

-- Check for any NULL user_ids (should return 0 rows)
SELECT 
  'threads' as table_name,
  COUNT(*) as null_user_ids
FROM threads
WHERE user_id IS NULL
UNION ALL
SELECT 
  'system_settings' as table_name,
  COUNT(*) as null_user_ids
FROM system_settings
WHERE user_id IS NULL
UNION ALL
SELECT 
  'email_recipients' as table_name,
  COUNT(*) as null_user_ids
FROM email_recipients
WHERE user_id IS NULL
UNION ALL
SELECT 
  'article_summaries' as table_name,
  COUNT(*) as null_user_ids
FROM article_summaries
WHERE user_id IS NULL
UNION ALL
SELECT 
  'summary_evaluations' as table_name,
  COUNT(*) as null_user_ids
FROM summary_evaluations
WHERE user_id IS NULL;

-- Count records per user
SELECT 
  'threads' as table_name,
  user_id,
  COUNT(*) as record_count
FROM threads
GROUP BY user_id
UNION ALL
SELECT 
  'system_settings' as table_name,
  user_id,
  COUNT(*) as record_count
FROM system_settings
GROUP BY user_id
UNION ALL
SELECT 
  'email_recipients' as table_name,
  user_id,
  COUNT(*) as record_count
FROM email_recipients
GROUP BY user_id
UNION ALL
SELECT 
  'article_summaries' as table_name,
  user_id,
  COUNT(*) as record_count
FROM article_summaries
GROUP BY user_id
UNION ALL
SELECT 
  'summary_evaluations' as table_name,
  user_id,
  COUNT(*) as record_count
FROM summary_evaluations
GROUP BY user_id
ORDER BY table_name, user_id;

-- ============================================================================
-- Migration Complete
-- ============================================================================

