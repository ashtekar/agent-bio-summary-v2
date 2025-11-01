# Migration: Drop Old Human Evaluation Columns

## Why Drop Them?

The old human evaluation columns in `article_summaries` and `daily_summaries` tables were designed for single evaluations per summary. Since we now use the `summary_evaluations` table for multiple graders, these columns are:

1. **Not used** - No code actually writes to or reads from them
2. **Confusing** - Having two evaluation systems is misleading
3. **Dead code** - They just clutter the schema

## Migration SQL

### Step 1: Backup (Optional - if you have existing data)

```sql
-- Check if you have any existing evaluation data
SELECT COUNT(*) as article_summaries_with_evals
FROM article_summaries 
WHERE evaluated_by IS NOT NULL;

SELECT COUNT(*) as daily_summaries_with_evals
FROM daily_summaries 
WHERE evaluated_by IS NOT NULL;
```

If you have data you want to keep, migrate it first (see `EVALUATIONS-MIGRATION.md`).

### Step 2: Drop Columns from `article_summaries`

```sql
ALTER TABLE article_summaries
DROP COLUMN IF EXISTS human_overall_score,
DROP COLUMN IF EXISTS human_simple_terminology,
DROP COLUMN IF EXISTS human_clear_concept,
DROP COLUMN IF EXISTS human_clear_methodology,
DROP COLUMN IF EXISTS human_balanced_details,
DROP COLUMN IF EXISTS human_feedback,
DROP COLUMN IF EXISTS evaluated_by,
DROP COLUMN IF EXISTS evaluated_at;
```

### Step 3: Drop Columns from `daily_summaries`

```sql
ALTER TABLE daily_summaries
DROP COLUMN IF EXISTS human_overall_score,
DROP COLUMN IF EXISTS human_simple_terminology,
DROP COLUMN IF EXISTS human_clear_concept,
DROP COLUMN IF EXISTS human_clear_methodology,
DROP COLUMN IF EXISTS human_balanced_details,
DROP COLUMN IF EXISTS human_feedback,
DROP COLUMN IF EXISTS evaluated_by,
DROP COLUMN IF EXISTS evaluated_at;
```

### Step 4: Drop Related Indexes (if they exist)

```sql
DROP INDEX IF EXISTS idx_article_summaries_human_eval;
DROP INDEX IF EXISTS idx_daily_summaries_human_eval;
```

## Code Changes Required

After dropping the columns, update:

1. ? Remove `addHumanEvaluation()` method from `SummaryStorageService`
2. ? Remove human evaluation fields from `ArticleSummaryRecord` and `DailySummaryRecord` types
3. ? Remove human evaluation field mappings from `SummaryStorageService` query results

## Verification

After migration, verify:

```sql
-- Should return no columns with 'human_' prefix
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'article_summaries' 
AND column_name LIKE 'human_%';

-- Should return no columns with 'human_' prefix
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'daily_summaries' 
AND column_name LIKE 'human_%';
```

## Rollback Plan

If you need to rollback, the columns can be re-added:

```sql
ALTER TABLE article_summaries
ADD COLUMN human_overall_score DECIMAL(3,2),
ADD COLUMN human_simple_terminology DECIMAL(3,2),
ADD COLUMN human_clear_concept DECIMAL(3,2),
ADD COLUMN human_clear_methodology DECIMAL(3,2),
ADD COLUMN human_balanced_details DECIMAL(3,2),
ADD COLUMN human_feedback TEXT,
ADD COLUMN evaluated_by VARCHAR(100),
ADD COLUMN evaluated_at TIMESTAMP WITH TIME ZONE;
```

However, any data that was in those columns before dropping will be lost.
