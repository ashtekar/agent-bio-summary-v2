# Summary Storage Database Schema

## Overview

This document defines the database schema for storing article and daily summaries in Supabase, following the hybrid storage approach where LangSmith is the source of truth for evaluation metrics.

## Tables

### 1. `article_summaries` Table

Stores individual article summaries with LangSmith run ID for evaluation tracking.

```sql
CREATE TABLE article_summaries (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Links
  article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  
  -- Summary content (for dashboard display)
  summary TEXT NOT NULL,
  
  -- Model info
  model_used VARCHAR(100) NOT NULL,
  
  -- LangSmith pointer (for fetching evaluation scores)
  langsmith_run_id TEXT NOT NULL,
  
  -- Human evaluation (for comparison tool - use case 2)
  -- Based on college sophomore rubric
  human_overall_score DECIMAL(3,2) CHECK (human_overall_score >= 0 AND human_overall_score <= 1),
  human_simple_terminology DECIMAL(3,2), -- Easy to understand terminology
  human_clear_concept DECIMAL(3,2), -- Clear concept explanation
  human_clear_methodology DECIMAL(3,2), -- Clear methods/practices explanation
  human_balanced_details DECIMAL(3,2), -- Balanced details (concept, methods, findings, impact)
  human_feedback TEXT,
  evaluated_by VARCHAR(100),
  evaluated_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT article_summaries_unique UNIQUE (article_id, thread_id)
);

-- Indexes
CREATE INDEX idx_article_summaries_thread ON article_summaries(thread_id);
CREATE INDEX idx_article_summaries_article ON article_summaries(article_id);
CREATE INDEX idx_article_summaries_langsmith ON article_summaries(langsmith_run_id);
CREATE INDEX idx_article_summaries_human_eval ON article_summaries(human_overall_score) WHERE human_overall_score IS NOT NULL;
CREATE INDEX idx_article_summaries_created ON article_summaries(created_at DESC);
```

### 2. `daily_summaries` Table (Migration)

Migrate existing table to match hybrid storage schema.

```sql
-- First, backup existing data if any
-- CREATE TABLE daily_summaries_backup AS SELECT * FROM daily_summaries;

-- Drop existing table
DROP TABLE IF EXISTS daily_summaries;

-- Create new table with hybrid storage schema
CREATE TABLE daily_summaries (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to thread (one per day)
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE UNIQUE,
  
  -- Summary content (for dashboard display)
  collated_summary TEXT NOT NULL,
  html_content TEXT, -- Final HTML email content
  
  -- Model info
  collation_model VARCHAR(100) NOT NULL,
  articles_summarized INTEGER NOT NULL,
  
  -- LangSmith pointer (for fetching evaluation scores)
  langsmith_run_id TEXT NOT NULL,
  
  -- Human evaluation (for comparison tool - use case 2)
  -- Based on college sophomore rubric
  human_overall_score DECIMAL(3,2) CHECK (human_overall_score >= 0 AND human_overall_score <= 1),
  human_simple_terminology DECIMAL(3,2), -- Easy to understand terminology
  human_clear_concept DECIMAL(3,2), -- Clear concept explanation
  human_clear_methodology DECIMAL(3,2), -- Clear methods/practices explanation
  human_balanced_details DECIMAL(3,2), -- Balanced details (concept, methods, findings, impact)
  human_feedback TEXT,
  evaluated_by VARCHAR(100),
  evaluated_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_daily_summaries_thread ON daily_summaries(thread_id);
CREATE INDEX idx_daily_summaries_langsmith ON daily_summaries(langsmith_run_id);
CREATE INDEX idx_daily_summaries_human_eval ON daily_summaries(human_overall_score) WHERE human_overall_score IS NOT NULL;
CREATE INDEX idx_daily_summaries_created ON daily_summaries(created_at DESC);
```

## Migration Steps

### Step 1: Create `article_summaries` Table
Run the first SQL block above in your Supabase SQL editor.

### Step 2: Migrate `daily_summaries` Table
Run the second SQL block above in your Supabase SQL editor.

**Note**: This will drop the existing `daily_summaries` table. If you have important data, uncomment the backup line first.

## Usage Examples

### Save Article Summary
```typescript
await summaryStorageService.saveArticleSummary({
  articleId: 'article_123',
  threadId: 'thread_456',
  summary: 'This article discusses...',
  modelUsed: 'gpt-4o-mini',
  langsmithRunId: 'run_789'
});
```

### Save Daily Summary
```typescript
await summaryStorageService.saveDailySummary({
  threadId: 'thread_456',
  collatedSummary: 'Today in synthetic biology...',
  htmlContent: '<h1>Daily Summary</h1>...',
  collationModel: 'ft:gpt-4.1-nano-2025-04-14:personal::CFRUvxM1',
  articlesSummarized: 5,
  langsmithRunId: 'run_790'
});
```

### Fetch Summaries for Thread
```typescript
const dailySummary = await summaryStorageService.getDailySummary('thread_456');
const articleSummaries = await summaryStorageService.getArticleSummariesByThread('thread_456');
```

## Relationship Diagram

```
threads (id)
    ├── daily_summaries (thread_id) → 1:1
    └── article_summaries (thread_id) → 1:many
```

## LangSmith Integration

- `langsmith_run_id` stores the run ID from LangSmith traces
- Evaluation scores are fetched from LangSmith API using this ID
- Human evaluation scores can be exported back to LangSmith as annotations
- Direct links to LangSmith traces: `https://smith.langchain.com/o/{orgId}/projects/p/{projectId}/r/{runId}`

## Future Enhancements

### Human Evaluation (Use Case 2)
- Human evaluators can score summaries using the rubric
- Scores stored in `human_*` columns
- Can be exported to LangSmith as annotations

### Prompt Improvement (Use Case 3)
- Compare human vs automated scores
- Identify disagreements
- Iterate on prompts based on feedback
- Re-run evaluations to measure improvement
