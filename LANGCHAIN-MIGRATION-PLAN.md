# LangChain Full Migration Plan

## Executive Summary

Migrate agent orchestration, prompts, and tracing to LangChain/LangSmith for better observability, prompt management, and debugging.

**Current State:**
- ✅ **Evals already use LangChain** - LLM-as-a-judge runs on every summary (GPT-4o-mini, ~$0.20/month)
- ✅ **4 prompts using LangChain** - Summarization, collation, and evaluation prompts
- ⏳ **Tracing partially implemented** - Stubs exist, need real LangSmith client
- ❌ **Agent orchestration uses direct OpenAI SDK** - Needs migration to LangChain Agent

**Key Point:** LangChain wraps OpenAI SDK (doesn't replace it). You keep using OpenAI models, API keys, and the `openai` package.

**Migration Focus:**
1. Implement real tracing infrastructure (Week 1)
2. Link eval scores to traces via annotations (Week 1)
3. Add tracing to all tools (Week 2)
4. Migrate agent to LangChain orchestration (Week 3)
5. Move prompts to LangSmith Hub (Week 4)

---

## Current Status: ~25% Complete

### ✅ Already Done
- Environment configured (API key, tracing enabled, project: `agent-bio-summary-v2`)
- 4 prompts using LangChain (summarization, collation, evaluation, collatedEvaluation)
- SummaryTools uses LangChain for generation and LLM-as-a-judge evaluation
- Evals already working: GPT-4o-mini scores every summary (~$0.20/month)

### ❌ Not Done Yet
- Agent orchestration still uses direct OpenAI SDK (line 151 in LLMDrivenBioSummaryAgent.ts)
- Tracing stubs not implemented (`this.client = null`, `this.tracer = null`)
- 259 console.log statements (should be traces)
- Eval scores not linked to traces in LangSmith
- Prompts hardcoded (not in LangSmith Hub)

---

## Quick Start: Priority Actions

### Action 1: Test LangSmith (15 min) - DO THIS FIRST

```bash
npm test -- src/integration/__tests__/end-to-end-single-article.test.ts

# Check dashboard:
open https://smith.langchain.com/o/default/projects/p/agent-bio-summary-v2/r
```

### Action 2: Install LangSmith SDK (5 min)

```bash
npm install langsmith zod
```

### Action 3: Implement Real LangSmith Client (2-3 hours)

**File: `src/lib/langchain.ts`** (lines 24-25)

```typescript
import { Client } from 'langsmith';

// Replace:
// this.client = null;
// this.tracer = null;

// With:
this.client = new Client({
  apiKey: process.env.LANGCHAIN_API_KEY,
  projectName: process.env.LANGCHAIN_PROJECT || 'agent-bio-summary-v2'
});
```

### Action 4: Link Eval Scores to Traces (1-2 hours)

**File: `src/lib/langchain.ts`** - Implement `addAnnotation()` (line 352-367)

```typescript
async addAnnotation(params: {
  traceId: string;
  annotation: {
    type: 'pass' | 'fail';
    score: number;
    feedback: string;
    evaluator: string;
  };
}): Promise<void> {
  if (!this.client) return;
  
  try {
    await this.client.createFeedback(params.traceId, {
      key: 'quality_score',
      score: params.annotation.score,
      comment: params.annotation.feedback
    });
  } catch (error) {
    console.error('Failed to add annotation:', error);
  }
}
```

**File: `src/tools/SummaryTools.ts`** - Call it after eval (after line 46)

```typescript
const evaluationResult = await this.langchain.evaluateSummary({...});

// NEW: Link score to trace
await this.langchain.addAnnotation({
  traceId: summaryResult.traceId,
  annotation: {
    type: evaluationResult.overallScore >= 0.5 ? 'pass' : 'fail',
    score: evaluationResult.overallScore,
    feedback: evaluationResult.feedback,
    evaluator: 'gpt-4o-mini'
  }
});
```

---

## Migration Phases (5-7 Weeks)

### Week 1: Foundation ⏳ **START HERE**
1. ✅ Test LangSmith connection (15 min)
2. ✅ Install langsmith package (5 min)
3. ✅ Implement real LangSmith Client (2-3 hours)
4. ✅ Implement addAnnotation() (1-2 hours)
5. ✅ Create tracing utility wrapper (2-3 hours)

**Deliverable:** Real tracing infrastructure + eval scores visible in LangSmith

### Week 2: Tool Tracing
6. Add tracing to SearchTools (1-2 hours)
7. Add tracing to ProcessingTools (1-2 hours)
8. Add tracing to EmailTools (1-2 hours)
9. Test end-to-end tracing (1 hour)

**Deliverable:** All tools traced in LangSmith dashboard

### Week 3: Agent Migration
10. Convert tool definitions to LangChain format (DynamicStructuredTool + Zod)
11. Replace OpenAI SDK with LangChain AgentExecutor
12. Test agent with full tracing

**Deliverable:** Agent using LangChain orchestration

### Week 4: Prompt Hub
13. Upload prompts to LangSmith Hub (private workspace)
14. Implement prompt fetching with caching (10 min TTL)
15. Add A/B testing infrastructure
16. Test prompt updates without code deploy

**Deliverable:** Prompts managed in LangSmith Hub

### Week 5-7: Polish & Production
17. Add custom dashboards (quality, performance, agent behavior)
18. Setup alerting (quality < 0.5, errors > 10%, latency spikes)
19. Replace console.log with structured logging
20. Update tests for LangChain
21. Production rollout (canary → full)

**Deliverable:** Production-ready system with full observability

---

## Code Examples

### Tracing Utility Wrapper

**New File: `src/lib/tracing.ts`**

```typescript
import { Client } from 'langsmith';

export class TracingWrapper {
  private client: Client;
  
  constructor() {
    this.client = new Client({
      apiKey: process.env.LANGCHAIN_API_KEY,
      projectName: process.env.LANGCHAIN_PROJECT
    });
  }
  
  async traceToolExecution<T>(
    toolName: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await fn();
      
      await this.client.createRun({
        name: toolName,
        run_type: 'tool',
        start_time: startTime,
        end_time: Date.now(),
        extra: { ...metadata, success: true }
      });
      
      return result;
    } catch (error) {
      await this.client.createRun({
        name: toolName,
        run_type: 'tool',
        start_time: startTime,
        end_time: Date.now(),
        error: error.message,
        extra: { ...metadata, success: false }
      });
      
      throw error;
    }
  }
}
```

### Using Tracing Wrapper in Tools

```typescript
// In SearchTools.ts, ProcessingTools.ts, EmailTools.ts
import { TracingWrapper } from '@/lib/tracing';

export class SearchTools {
  private tracing: TracingWrapper;
  
  constructor() {
    this.tracing = new TracingWrapper();
  }
  
  async searchWeb(params: SearchParams): Promise<ToolResult> {
    return this.tracing.traceToolExecution(
      'searchWeb',
      async () => {
        // Existing implementation
        const results = await this.performSearch(params);
        return { success: true, data: results };
      },
      { query: params.query, maxResults: params.maxResults }
    );
  }
}
```

### LangChain Tool Format (Week 3)

```typescript
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

const searchWebTool = new DynamicStructuredTool({
  name: 'searchWeb',
  description: 'Search for synthetic biology articles',
  schema: z.object({
    query: z.string(),
    maxResults: z.number().optional().default(10),
    dateRange: z.string().optional()
  }),
  func: async (input) => {
    return await searchTools.searchWeb(input);
  }
});
```

### Prompt Hub Integration (Week 4)

**Environment Variables:**
```bash
# Add to .env.local
PROMPT_SOURCE=hub          # or "local" for fallback
PROMPT_VERSION=latest
PROMPT_CACHE_TTL=600       # 10 minutes
```

**Implementation:**
```typescript
import { pull } from 'langchain/hub';

async initializePrompts() {
  if (this.useHub) {
    try {
      this.prompts.set('summarization', 
        await pull('agent-bio-summary-v2/summarization:latest'));
      // Cache for 10 min, fallback to hardcoded if hub fails
    } catch (error) {
      this.loadHardcodedPrompts(); // Fallback
    }
  }
}
```

---

## Success Metrics

### Week 1
- [ ] Traces visible in LangSmith dashboard
- [ ] Eval scores linked to summary traces
- [ ] Quality dashboard showing trends

### Week 4
- [ ] All prompts in LangSmith Hub
- [ ] Prompt updates without code deploys
- [ ] A/B test running on 2 prompts

### Week 7
- [ ] 100% agent runs traced
- [ ] Zero console.log in production
- [ ] Quality alerts working (< 0.5 threshold)
- [ ] < 100ms tracing overhead

---

## Evaluation Strategy

**Decision:** Keep LangChain/LangSmith for evals ✅

**Why:**
- Already 80% implemented
- Cheap ($0.20/month for 10 articles/day)
- Good enough for educational content scale
- Can add human feedback later (you have `feedback` table!)

**Phased Approach:**
1. **Now - 6 months:** Enhance LangChain evals with annotations
2. **6-12 months:** Add human feedback collection in emails
3. **12+ months:** Meta-evaluation (decide if LangChain evals correlate with human ratings)

---

## Dependencies

```bash
# Install these (openai package stays!)
npm install langsmith @langchain/core @langchain/langgraph zod
```

**Don't remove:** `openai` package (LangChain uses it internally)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| LangSmith down | Fallback to hardcoded prompts, continue without tracing |
| Performance overhead | Async tracing, monitor P99 < 100ms |
| Breaking changes | Feature flags, gradual rollout, keep OpenAI fallback 1 month |
| Cost increase | Monitor usage, set alerts, sample traces if needed |

---

## Quick Reference

### Files to Create
1. `src/lib/tracing.ts` - Tracing utilities
2. `src/lib/promptTesting.ts` - A/B testing (Week 4)

### Files to Modify
1. `src/lib/langchain.ts` - Real LangSmith client + addAnnotation()
2. `src/tools/SummaryTools.ts` - Call addAnnotation() after eval
3. `src/tools/SearchTools.ts` - Add tracing wrapper
4. `src/tools/ProcessingTools.ts` - Add tracing wrapper
5. `src/tools/EmailTools.ts` - Add tracing wrapper
6. `src/agents/LLMDrivenBioSummaryAgent.ts` - Migrate to LangChain Agent (Week 3)
7. `src/tools/ToolDefinitions.ts` - Convert to DynamicStructuredTool (Week 3)

### Environment Variables (Already Set ✅)
- `LANGCHAIN_API_KEY` - LangSmith access
- `LANGCHAIN_TRACING_V2=true` - Enable tracing
- `LANGCHAIN_PROJECT=agent-bio-summary-v2` - Project namespace
- `LANGCHAIN_CALLBACKS_BACKGROUND=true` - Async tracing

### Key Decisions Made
- ✅ Keep OpenAI SDK (LangChain wraps it)
- ✅ Keep LangChain for evals (good enough, cheap)
- ✅ Use LangSmith Hub for prompts (Week 4)
- ✅ All prompts must be private
- ✅ Add human feedback later (Phase 2)
- ✅ Alert threshold: quality score < 0.5

---

## Next Steps

**This Week (Week 1):**
1. Run test to verify LangSmith connection (15 min)
2. Install langsmith package (5 min)
3. Implement real Client in langchain.ts (2-3 hours)
4. Implement addAnnotation() (1-2 hours)
5. Create tracing wrapper utility (2-3 hours)
6. Test end-to-end and check dashboard (1 hour)

**Total: ~10 hours = 2 days of work**

**After Week 1, you'll have:**
- ✅ Full observability in LangSmith
- ✅ Quality scores visible on traces
- ✅ Foundation for Weeks 2-7

---

## Questions Before Starting

1. ✅ LangSmith API key? **YES** - Configured in `.env.local`
2. ✅ Tracing mode? **YES** - Async/background enabled
3. ☐ Budget for LangSmith? **Estimate:** Free tier covers <5K traces/month
4. ☐ Who manages prompts? **Assign:** Team member for LangSmith Hub access
5. ☐ Quality alert threshold? **Recommend:** < 0.5
6. ☐ LangGraph needed? **Recommend:** No, start simple
7. ☐ Keep OpenAI fallback? **Recommend:** Yes for 1 month
8. ☐ Trace all runs? **Recommend:** Yes during migration

---

**Ready to start? Begin with Week 1, Action 1: Test LangSmith connection!** 🚀