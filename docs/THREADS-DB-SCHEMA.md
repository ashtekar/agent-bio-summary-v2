# Threads Database Schema

## Overview
The `threads` table stores metadata for each daily summary run, enabling thread-based tracking in LangSmith and historical analysis.

## Table: `threads`

```sql
CREATE TABLE threads (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Run identification
  run_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  
  -- Metrics
  articles_found INTEGER DEFAULT 0,
  articles_processed INTEGER DEFAULT 0,
  email_sent BOOLEAN DEFAULT false,
  
  -- LangSmith integration
  langsmith_url TEXT,
  langsmith_run_id UUID,
  
  -- Error tracking
  error_message TEXT,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata (JSONB for flexibility)
  metadata JSONB,
  
  -- Indexes for fast queries
  CONSTRAINT threads_run_date_key UNIQUE (run_date)
);

CREATE INDEX idx_threads_status ON threads(status);
CREATE INDEX idx_threads_run_date ON threads(run_date DESC);
CREATE INDEX idx_threads_started_at ON threads(started_at DESC);
```

## Metadata Schema

The `metadata` JSONB field contains:

```json
{
  "sessionId": "langchain_session_1728580800_abc123",
  "model": "gpt-4o",
  "relevancyThreshold": 0.2,
  "searchQuery": "synthetic biology biotechnology",
  "maxResults": 10,
  "sources": ["nature.com", "science.org", "biorxiv.org"],
  "recipients": ["ashtekar@gmail.com"]
}
```

## Usage Pattern

### 1. Create Thread (Start of Run)
```typescript
const thread = await threadService.createThread({
  run_date: '2025-10-10',
  status: 'running',
  metadata: {
    sessionId: context.sessionId,
    model: context.systemSettings.llmModel,
    relevancyThreshold: context.systemSettings.relevancyThreshold
  }
});

// thread.id is the threadId used in LangSmith
```

### 2. Update Thread (During Execution)
```typescript
await threadService.updateThread(threadId, {
  articles_found: 15,
  articles_processed: 12
});
```

### 3. Complete Thread (End of Run)
```typescript
await threadService.completeThread(threadId, {
  status: 'completed',
  email_sent: true,
  langsmith_url: `https://smith.langchain.com/o/${orgId}/projects/p/${projectId}/r/${runId}`,
  articles_found: 15,
  articles_processed: 12
});
```

## Benefits

1. **Thread Grouping**: All traces for one daily run grouped under single thread ID
2. **Historical Tracking**: Query past runs by date, status, metrics
3. **Frontend Integration**: Display run history with metrics
4. **Debugging**: Direct links to LangSmith traces
5. **Analytics**: Track success rates, article counts over time

## Migration

To create this table in your Supabase instance:

1. Go to Supabase SQL Editor
2. Run the CREATE TABLE statement above
3. Verify with: `SELECT * FROM threads;`

## Row-Level Security (RLS)

If you have RLS enabled, add policies:

```sql
-- Allow service role to read/write
CREATE POLICY "Service role full access" ON threads
  FOR ALL USING (auth.role() = 'service_role');
```

