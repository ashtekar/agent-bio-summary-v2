# LangChain Threads Implementation

## Overview

This implementation adds **Thread support** to the Agent Bio Summary system, enabling proper grouping and tracking of each daily summary run in LangSmith.

## Architecture

### What is a Thread?

A **Thread** represents a complete daily summary run, containing:
- All LangSmith traces (tool calls, LLM invocations)
- Execution metadata (articles found, processed, email sent)
- Status tracking (running, completed, failed)
- Direct link to LangSmith visualization

### Benefits

1. **Organized Tracing**: All operations for a single run grouped under one thread ID
2. **Historical Tracking**: Query past runs by date, status, and metrics
3. **Easy Debugging**: Click thread to see complete execution trace in LangSmith
4. **Frontend Integration**: Display run history with real data
5. **Analytics**: Track success rates, article counts, performance over time

## Components

### 1. Type Definitions (`src/types/agent.ts`)

```typescript
export interface AgentContext {
  threadId: string; // LangSmith thread ID
  // ... other fields
}

export interface Thread {
  id: string; // UUID
  run_date: string; // YYYY-MM-DD
  status: 'running' | 'completed' | 'failed';
  articles_found: number;
  articles_processed: number;
  email_sent: boolean;
  langsmith_url?: string;
  started_at: Date;
  completed_at?: Date;
  metadata?: { ... };
}
```

### 2. Thread Service (`src/services/ThreadService.ts`)

**Methods:**
- `createThread()` - Create new thread at start of run
- `updateThread()` - Update metrics during execution
- `completeThread()` - Mark as completed/failed at end
- `getThread()` - Fetch specific thread by ID
- `getRecentThreads()` - Get recent runs for frontend
- `getThreadByDate()` - Get thread for specific date

### 3. API Integration

#### Daily Summary API (`/api/daily-summary`)

**Flow:**
1. Create thread with `run_date` and metadata
2. Pass `threadId` to agent via context
3. Execute agent (traces automatically grouped)
4. Update thread with results
5. Mark as completed/failed

```typescript
// Before execution
const thread = await threadService.createThread({
  run_date: '2025-10-10',
  metadata: { model, threshold, sources, ... }
});

context.threadId = thread.id;

// After execution
await threadService.completeThread(threadId, {
  status: 'completed',
  email_sent: true,
  articles_found: 15,
  articles_processed: 12,
  langsmith_url: '...'
});
```

#### Threads API (`/api/threads`)

**Endpoints:**
- `GET /api/threads?limit=10` - Get recent threads
- `GET /api/threads?run_date=2025-10-10` - Get specific date

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc-123",
      "run_date": "2025-10-10",
      "status": "completed",
      "articles_found": 15,
      "articles_processed": 12,
      "email_sent": true,
      "langsmith_url": "https://smith.langchain.com/...",
      "started_at": "2025-10-10T08:00:00Z",
      "completed_at": "2025-10-10T08:05:23Z"
    }
  ]
}
```

### 4. Agent Integration

#### LangChainBioSummaryAgent

Thread ID is passed via `configurable` in `executor.invoke()`:

```typescript
await this.executor.invoke(
  { input: agentInput },
  {
    configurable: {
      thread_id: this.context.threadId,
      run_name: `Daily Summary ${runDate}`
    },
    runId: this.parentRunId,
    tags: [
      'daily-summary',
      `thread:${threadId}`,
      `model:${model}`,
      `date:${runDate}`
    ],
    metadata: {
      threadId,
      sessionId,
      runDate,
      relevancyThreshold
    }
  }
);
```

All tool calls within this execution automatically inherit the thread ID.

#### LLMDrivenBioSummaryAgent

Thread metadata added to initial trace:

```typescript
await langchainIntegration.createTrace({
  name: 'llm_driven_bio_summary',
  metadata: { 
    threadId: this.context.threadId,
    // ... other metadata
  },
  tags: [`thread:${this.context.threadId}`, ...]
});
```

### 5. Frontend Integration

#### Dashboard (`/dashboard`)

```typescript
// Fetches recent threads
const response = await fetch('/api/threads?limit=5');
const threads = result.data;

// Displays:
- Last run time (calculated from started_at)
- Articles found/processed
- Success count (completed threads)
```

#### Daily Summaries (`/summaries`)

```typescript
// Fetches all threads
const response = await fetch('/api/threads?limit=20');

// Displays list of runs with:
- Run date
- Article count
- Status (Email Sent / Failed / Running)
```

## Database Schema

### Table: `threads`

```sql
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date DATE NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  articles_found INTEGER DEFAULT 0,
  articles_processed INTEGER DEFAULT 0,
  email_sent BOOLEAN DEFAULT false,
  langsmith_url TEXT,
  langsmith_run_id UUID,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

CREATE INDEX idx_threads_status ON threads(status);
CREATE INDEX idx_threads_run_date ON threads(run_date DESC);
CREATE INDEX idx_threads_started_at ON threads(started_at DESC);
```

**Key Constraint:** `run_date` is UNIQUE - only one run per day.

## Setup Instructions

### 1. Create Database Table

Run the SQL from `docs/THREADS-DB-SCHEMA.md` in your Supabase SQL editor.

### 2. Environment Variables

Already configured:
- `LANGCHAIN_ORG_ID` - For LangSmith URLs
- `LANGCHAIN_PROJECT` - Project name in LangSmith

### 3. Deploy

```bash
git add -A
git commit -m "Add thread support"
git push origin main
```

### 4. Verify

After deployment:
1. Go to `/dashboard` - should show "Never" for last run
2. Click "Run Now" - creates first thread
3. Check Supabase `threads` table - should have one row
4. Check LangSmith - all traces tagged with `thread:xxx`
5. Refresh dashboard - shows real data from threads table

## Usage Examples

### Check Thread History

```bash
curl https://your-app.vercel.app/api/threads?limit=5
```

### Get Today's Thread

```bash
curl "https://your-app.vercel.app/api/threads?run_date=2025-10-10"
```

### Run Daily Summary (creates thread)

```bash
curl -X POST https://your-app.vercel.app/api/daily-summary \
  -H "Content-Type: application/json" \
  -d '{"useLangChainAgent": true}'
```

## LangSmith View

In LangSmith, you can now:
1. Filter traces by `thread:abc-123` tag
2. See all operations for a specific daily run grouped together
3. Compare thread performance across days
4. Click the `langsmith_url` from database to jump directly to traces

## Monitoring

Track these metrics from the `threads` table:
- **Success Rate**: `COUNT(*) WHERE status='completed'` / `COUNT(*)`
- **Average Articles**: `AVG(articles_processed)`
- **Average Duration**: `AVG(completed_at - started_at)`
- **Email Success**: `COUNT(*) WHERE email_sent=true`

## Next Steps

Future enhancements:
1. Add thread conversation history (if needed)
2. Add thread comparison view in frontend
3. Add thread export (PDF/JSON)
4. Add thread alerts (failed runs)
5. Add thread analytics dashboard

