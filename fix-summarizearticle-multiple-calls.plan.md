# Fix: summarizeArticle Multiple Calls Issue - Implementation Plan

## Problem Analysis

### Current Issue
The agent is making multiple calls to `summarizeArticle` unnecessarily. The tool is designed to automatically process ALL stored articles internally, but the agent is being instructed to call it multiple times with batches.

### Root Cause
**Conflicting tool behavior and instructions:**

1. **LangChain Tool** (`LangChainTools.ts` lines 269-333):
   - `summarizeArticleTool` processes ALL stored articles automatically
   - No parameters needed - reads from tool state
   - Handles batching internally (batches of 2)

2. **Agent Instructions** (`LLMDrivenBioSummaryAgent.ts` lines 127, 141, 143):
   - Instructs agent to call `summarizeArticle` with "MAX 2 articles per call"
   - Tells agent to "call summarizeArticle multiple times with batches of 2"
   - This conflicts with the tool's automatic behavior

3. **Tool Definition** (`ToolDefinitions.ts` lines 174-199):
   - Still defines `articles` parameter with `maxItems: 2`
   - Description says "Process articles in batches of maximum 2 articles"
   - Used by `LLMDrivenBioSummaryAgent` which tries to pass articles

### Impact
- Agent makes unnecessary multiple tool calls
- Confusion about whether to pass articles or let tool read from state
- Inconsistent behavior between LangChain agent and LLM-driven agent
- Potential for duplicate processing or missed articles

## Solution

### Strategy
**Align all tool descriptions and agent instructions** to reflect that `summarizeArticle` automatically processes ALL stored articles in one call.

### Changes Required

1. **LangChain Tool Description** - Already correct, but make it clearer
2. **Agent Instructions** - Remove batch instructions, call ONCE
3. **Tool Definitions** - Update to match LangChain behavior
4. **Hub Prompt** - Update orchestration prompt for LangChain agent

## Implementation Plan

### Step 1: Update LangChain Tool Description
**File**: `src/tools/LangChainTools.ts` (line 271)

**Current**:
```typescript
description: 'Generate comprehensive summaries for ALL stored articles. Reads from state (populated by extractScoreAndStoreArticles). Automatically processes all articles in batches of 2 to avoid JSON limits. Returns all summaries at once. IMPORTANT: Call extractScoreAndStoreArticles first.',
```

**Change to**:
```typescript
description: 'Generate comprehensive summaries for ALL stored articles automatically. No parameters needed - reads articles from shared state (populated by extractScoreAndStoreArticles). Processes all articles internally in batches and returns all summaries at once. Call this tool ONCE after extractScoreAndStoreArticles - do NOT call multiple times.',
```

### Step 2: Update LLMDriven Agent Instructions
**File**: `src/agents/LLMDrivenBioSummaryAgent.ts` (lines 127, 141-143)

**Current**:
```typescript
- summarizeArticle: Generate individual article summaries (MAX 2 articles per call)
...
CRITICAL JSON LIMITS:
- summarizeArticle: Process maximum 2 articles per call to prevent JSON parsing errors
- All tool arguments must be under 6000 characters total
- If you have more than 2 articles for summarization, call summarizeArticle multiple times with batches of 2
```

**Change to**:
```typescript
- summarizeArticle: Generate summaries for ALL stored articles automatically (call ONCE, no parameters needed)
...
WORKFLOW NOTES:
- summarizeArticle processes ALL stored articles automatically - call it ONCE after extractScoreAndStoreArticles
- The tool handles batching internally - you don't need to batch manually
- All summaries are returned at once after processing completes
```

### Step 3: Update Tool Definitions for LLMDriven Agent
**File**: `src/tools/ToolDefinitions.ts` (lines 175-199)

**Decision Point**: Two options:

**Option A: Match LangChain behavior (recommended)**
- Remove `articles` parameter entirely
- Tool reads from state automatically
- Agent calls with no parameters

**Option B: Keep parameter for backward compatibility**
- Make parameter optional
- Update description to clarify tool reads from state if not provided
- Agent can call with empty parameters

**Recommendation**: **Option A** - Full consistency with LangChain implementation.

**Current**:
```typescript
{
  name: 'summarizeArticle',
  description: 'Generate individual summaries for articles using Langchain and OpenAI, minimum 100 words each. IMPORTANT: Process articles in batches of maximum 2 articles to avoid JSON parsing errors.',
  parameters: {
    type: 'object',
    properties: {
      articles: {
        type: 'array',
        maxItems: 2,
        items: { ... },
        description: 'Array of articles to summarize (maximum 2 articles per call)'
      }
    },
    required: ['articles']
  }
}
```

**Change to** (Option A):
```typescript
{
  name: 'summarizeArticle',
  description: 'Generate comprehensive summaries for ALL stored articles automatically. No parameters needed - reads articles from shared state populated by extractScoreAndStoreArticles. Processes all articles internally and returns all summaries at once. Call this tool ONCE after extractScoreAndStoreArticles.',
  parameters: {
    type: 'object',
    properties: {}  // No parameters - tool reads from state
  }
}
```

### Step 4: Update LLMDriven Agent Tool Execution
**File**: `src/agents/LLMDrivenBioSummaryAgent.ts` (line 729-734)

**Current**:
```typescript
case 'summarizeArticle':
  const summarizeResult = await this.summaryTools.summarizeArticle(args.articles);
```

**Change to**:
```typescript
case 'summarizeArticle':
  // Read stored articles from context (tool reads from state in LangChain version)
  const articlesToSummarize = args.articles || this.context.storedArticles || [];
  if (articlesToSummarize.length === 0) {
    throw new Error('No articles available to summarize. Call extractScoreAndStoreArticles first.');
  }
  const summarizeResult = await this.summaryTools.summarizeArticle(articlesToSummarize);
```

**Note**: For full consistency, we could refactor `SummaryTools.summarizeArticle` to also read from state when no articles provided, but that's a larger refactor.

### Step 5: Update Hub Orchestration Prompt
**File**: `docs/prompts-for-hub-upload.md` (line 140)

**Current**:
```
3. summarizeArticle: Generate comprehensive summaries of stored articles
   - No parameters needed - processes all stored articles automatically
   - Creates summaries of at least 100 words each
   - Stores summaries in shared state for collation
```

**Update to** (already mostly correct):
```
3. summarizeArticle: Generate comprehensive summaries for ALL stored articles automatically
   - No parameters needed - reads articles from shared state (populated by extractScoreAndStoreArticles)
   - Processes all articles internally in batches
   - Returns all summaries at once
   - IMPORTANT: Call this tool ONCE after extractScoreAndStoreArticles - do NOT call multiple times
   - Stores summaries in shared state for collation
```

## Testing Plan

### Test Cases

1. **Single Call Test**
   - Run agent with 5 stored articles
   - Verify `summarizeArticle` is called exactly ONCE
   - Verify all 5 summaries are generated

2. **No Multiple Calls Test**
   - Monitor tool calls in logs
   - Ensure agent doesn't attempt multiple `summarizeArticle` calls
   - Verify agent understands "call ONCE" instruction

3. **State Reading Test** (LangChain)
   - Verify tool reads from state correctly
   - Verify tool processes all stored articles
   - Verify summaries are stored in state for collation

4. **Backward Compatibility** (LLMDriven)
   - Verify tool still works with articles passed as parameter
   - Verify fallback to context.storedArticles works
   - Verify error handling when no articles available

## Expected Outcome

After implementation:

✅ Agent calls `summarizeArticle` exactly ONCE per execution
✅ Tool automatically processes ALL stored articles
✅ Consistent behavior between LangChain and LLM-driven agents
✅ Clear instructions that eliminate confusion about batching
✅ No duplicate tool calls or unnecessary iterations

## Rollback Plan

If issues arise:
1. Revert tool description changes
2. Keep batch instructions if agent struggles with single call
3. Consider hybrid approach: tool accepts optional parameter but prefers state

## Implementation Priority

**High Priority**: This fix eliminates unnecessary API calls and reduces execution time and cost.

**Estimated Impact**:
- Reduces tool calls from N/2 to 1 (where N = number of articles)
- Faster execution (parallel processing handled internally)
- Lower token usage (fewer tool call descriptions)
- More predictable agent behavior

---

*This plan addresses the core issue of conflicting instructions causing multiple unnecessary tool calls by aligning all tool descriptions and agent instructions to reflect the automatic batch processing behavior.*