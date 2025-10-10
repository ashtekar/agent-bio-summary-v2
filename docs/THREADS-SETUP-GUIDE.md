# Quick Setup Guide: Thread Support

## 1. Create Database Table (Required)

Run this SQL in your Supabase SQL Editor:

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

## 2. Test Locally

```bash
# Make sure dev server is running
npm run dev

# Open browser to http://localhost:3000/dashboard
# Click "Run Now" button
# Check if thread is created in Supabase
```

## 3. Verify in Supabase

```sql
-- Check if thread was created
SELECT * FROM threads ORDER BY started_at DESC LIMIT 1;
```

## 4. Verify in LangSmith

1. Go to https://smith.langchain.com
2. Open your project: `agent-bio-summary-v2`
3. Filter by tag: `thread:xxx` (copy thread ID from database)
4. All traces for that run should appear

## 5. Deploy

```bash
git add -A
git commit -m "Add thread support for LangSmith integration"
git push origin main
```

## Done! 🎉

Your daily summary runs are now tracked as threads:
- ✅ Each run creates a unique thread
- ✅ All traces grouped under thread ID
- ✅ Metrics stored in database
- ✅ Frontend displays real data
- ✅ Direct links to LangSmith traces

## Troubleshooting

**Problem:** "Failed to create thread" error

**Solution:** Check Supabase credentials in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Problem:** Threads not showing in dashboard

**Solution:** 
1. Check Supabase table exists: `SELECT * FROM threads;`
2. Check API: `curl http://localhost:3000/api/threads`
3. Check browser console for errors

