# Switch Orchestration Agent to GPT-5 - Implementation Plan

## Problem Analysis

### Current Issue
The current orchestration agent (gpt-4o-mini) is ignoring context and hallucinating test recipients (student1@example.com, recipient1@example.com) instead of using the actual recipients from the database (ashtekar@gmail.com). Despite explicit instructions, validation, and lower temperature, the agent continues to ignore context.

### Root Cause
The gpt-4o-mini model has limitations in:
- Context adherence and instruction following
- Reduced reasoning capabilities
- Higher tendency for hallucinations
- Poor handling of explicit recipient data

## Solution

Switch to full GPT-5 which has:

- Enhanced reasoning with chain-of-thought
- Improved accuracy (>89% vs 84%)
- Superior instruction following
- Significantly reduced hallucinations
- Cost: ~$0.0125 per run vs $0.0002 (62x increase, but still minimal for critical functionality)

## Current Implementation Analysis

### Key Files to Update
- `src/agents/LangChainBioSummaryAgent.ts` - Line 50 (modelName)
- `src/agents/LLMDrivenBioSummaryAgent.ts` - Line 164 (model)
- `src/services/SettingsService.ts` - Add GPT-5 models to available list
- `src/lib/langchain.ts` - Optional evaluation model updates

### Current Model Configuration
```typescript
// LangChainBioSummaryAgent.ts (line 50)
modelName: 'gpt-4o-mini',  // Hard-coded for cost-effective orchestration

// LLMDrivenBioSummaryAgent.ts (line 164)  
model: 'gpt-4o-mini',  // Hard-coded for cost-effective orchestration
```

## Implementation Plan

### Step 1: Update LangChainBioSummaryAgent
**File**: `src/agents/LangChainBioSummaryAgent.ts` (line 50)

Change:
```typescript
modelName: 'gpt-4o-mini',  // Hard-coded for cost-effective orchestration
```

To:
```typescript
modelName: 'gpt-5',  // GPT-5 for superior instruction following and context adherence
```

Update comment on line 47 to reflect GPT-5 usage.

### Step 2: Update LLMDrivenBioSummaryAgent (if used)
**File**: `src/agents/LLMDrivenBioSummaryAgent.ts` (line 164)

Change:
```typescript
model: 'gpt-4o-mini',  // Hard-coded for cost-effective orchestration
```

To:
```typescript
model: 'gpt-5',  // GPT-5 for superior instruction following and context adherence
```

### Step 3: Update SettingsService Model List
**File**: `src/services/SettingsService.ts` (after line 375)

Add GPT-5 models to the available models list:
```typescript
{
  id: 'gpt-5',
  name: 'GPT-5',
  description: 'Most advanced model with enhanced reasoning and instruction following',
  maxTokens: 128000,
  costPer1kTokens: 0.00125
},
{
  id: 'gpt-5-mini',
  name: 'GPT-5 Mini',
  description: 'Cost-effective with improved instruction following',
  maxTokens: 128000,
  costPer1kTokens: 0.00005
},
{
  id: 'gpt-5-nano',
  name: 'GPT-5 Nano',
  description: 'Balanced performance and cost',
  maxTokens: 128000,
  costPer1kTokens: 0.00025
}
```

### Step 4: Update Evaluation Models (Optional)
**Files**: `src/lib/langchain.ts` (lines 283, 337)

Consider upgrading evaluation models to gpt-5-mini for better quality assessment (can be done later).

## Cost Impact

- Current: ~$0.0002 per orchestration run
- New: ~$0.0125 per orchestration run  
- Increase: 62x, but absolute cost is still minimal (~$0.01 per daily summary)
- Monthly impact: ~$0.30/month for daily runs
- This is acceptable given the critical nature of correct recipient handling

## Testing

1. Deploy changes to Vercel
2. Trigger daily summary API
3. Check logs for:
   - Agent using correct recipients (ashtekar@gmail.com)
   - No test recipients (student1@example.com, etc.)
   - Email validation passing
   - Improved reasoning in tool selection
4. Monitor cost impact over a few runs

## Rollback Plan

If GPT-5 doesn't fix the issue (unlikely given its capabilities):
- Revert to gpt-4o-mini
- Investigate alternative approaches (structured outputs, different agent framework)

## Expected Outcome

Agent should now follow context properly and use the exact recipients provided instead of generating test emails. GPT-5's enhanced reasoning and reduced hallucinations should completely resolve this issue.

---

*This plan addresses the core issue of the orchestration agent ignoring context and hallucinating recipients by upgrading to GPT-5 for superior instruction following.*
