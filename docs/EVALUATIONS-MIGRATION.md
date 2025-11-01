# Human Evaluations Migration Guide

## Overview

This document explains the migration from single-evaluation to multi-evaluation schema for human grading.

## Schema Evolution

### Phase 1: Original Schema (Single Evaluation)

The original `article_summaries` table included these columns for human evaluation:

```sql
human_overall_score DECIMAL(3,2)
human_simple_terminology DECIMAL(3,2)
human_clear_concept DECIMAL(3,2)
human_clear_methodology DECIMAL(3,2)
human_balanced_details DECIMAL(3,2)
human_feedback TEXT
evaluated_by VARCHAR(100)
evaluated_at TIMESTAMP WITH TIME ZONE
```

**Limitation**: Only one evaluation per summary could be stored.

### Phase 2: New Schema (Multiple Evaluations)

A new `summary_evaluations` table was created to support:
- Multiple graders per summary
- Tracking which specific grader provided each evaluation
- Better separation of concerns

## Current State

**Both schemas coexist:**

1. **Old columns in `article_summaries`**: Still exist but are **NOT used** by the new grading system
   - The `addHumanEvaluation()` method in `SummaryStorageService` still exists but is not called
   - These columns may contain legacy data

2. **New `summary_evaluations` table**: Used by the current grading system
   - All new evaluations go here
   - Supports multiple graders per summary

## Recommendations

### Option 1: Keep Both (Recommended for now)
- Keep old columns for backward compatibility
- Use new table for all new evaluations
- Migrate old data if needed

### Option 2: Deprecate Old Columns
- Mark old columns as deprecated in documentation
- Eventually remove them in a future migration
- Use only `summary_evaluations` going forward

### Option 3: Migrate Old Data
If you have existing evaluations in `article_summaries`, you can migrate them:

```sql
-- Migrate existing single evaluations to new table
INSERT INTO summary_evaluations (
  summary_id,
  grader_email,
  grader_name,
  simple_terminology,
  clear_concept,
  clear_methodology,
  balanced_details,
  feedback,
  created_at
)
SELECT 
  id as summary_id,
  evaluated_by as grader_email,
  NULL as grader_name,
  human_simple_terminology,
  human_clear_concept,
  human_clear_methodology,
  human_balanced_details,
  human_feedback,
  evaluated_at as created_at
FROM article_summaries
WHERE evaluated_by IS NOT NULL
  AND human_simple_terminology IS NOT NULL;
```

## Future Considerations

1. **Remove old columns**: After ensuring no dependencies, consider removing old evaluation columns from `article_summaries`
2. **Update SummaryStorageService**: Remove or deprecate `addHumanEvaluation()` method
3. **Data cleanup**: Decide whether to migrate or archive old evaluation data

## Impact on Code

### What Changed
- New evaluations are saved via `EvaluationService.saveEvaluation()`
- Old `SummaryStorageService.addHumanEvaluation()` is no longer used

### What Stayed the Same
- Summary content storage unchanged
- Reading summaries unchanged (old evaluation columns are just ignored)
