# LLM-as-a-Judge Migration to GPT-5.1 - Design & Implementation Plan

## Executive Summary

Migrate the evaluation system from `gpt-4o-mini` to `gpt-5.1` for improved evaluation quality, consistency, and alignment with the orchestration agent's model architecture.

---

## Current State Analysis

### Existing Implementation
**Location**: `src/lib/langchain.ts`

**Current Evaluator Configuration**:
```typescript
const evaluatorModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4o-mini',      // Current model
  temperature: 0.2,               // Low temp for consistency
  maxTokens: 1000,
});
```

**Methods Using Evaluator**:
1. `evaluateSummary()` - Lines 268-320
   - Evaluates individual article summaries
   - Returns: coherence, accuracy, completeness, readability, overallScore, feedback
   
2. `evaluateCollatedSummary()` - Lines 326-376
   - Evaluates combined daily summaries
   - Returns: same metrics as individual evaluation

**Current Status**: Both methods marked `@deprecated` with recommendation to use LangSmith UI evaluators

**Usage Context**:
- Provides programmatic evaluation scores
- Used for automated quality tracking
- Fallback scoring (0.5) on failure

---

## Design Decisions

### 1. Model Selection: GPT-5.1 vs GPT-5.1-mini

#### Option A: GPT-5.1 (Recommended)
**Pros**:
- Highest evaluation quality
- Best instruction following for nuanced scoring
- Consistent with orchestration agent architecture
- Better at detecting subtle quality issues

**Cons**:
- Higher cost per evaluation (~5x more than gpt-4o-mini)
- Slightly slower execution

**Cost Analysis**:
- Current: ~$0.00015 per evaluation (gpt-4o-mini)
- Proposed: ~$0.00125 per evaluation (gpt-5.1)
- Impact: If running 100 evaluations/day = $0.125/day vs $0.015/day
- Monthly difference: ~$3.30 (negligible for quality improvement)

#### Option B: GPT-5.1-mini
**Pros**:
- Better than gpt-4o-mini
- More cost-effective than full GPT-5.1
- Still good instruction following

**Cons**:
- Not as consistent as GPT-5.1
- May miss subtle quality issues

**Recommendation**: Use **GPT-5.1** for evaluation quality and consistency

---

### 2. Temperature Configuration

**Options**:
1. **Keep 0.2** (Current, Recommended)
   - Maintains deterministic scoring
   - Consistent evaluation across runs
   - Good for comparing scores over time
   
2. **Use 1.0** (GPT-5.1 default)
   - Required if model enforces it
   - More variability in scores
   - May be more "truthful" to model's assessment

**Decision**: 
- Start with `temperature: 0.2` for consistency
- If GPT-5.1 enforces `temperature: 1`, document the change and monitor score variance

---

### 3. Reasoning Effort Parameter

**Question**: Should we add `reasoningEffort: 'low'` or `'medium'`?

**Analysis**:
- **For 'low'**: Evaluation is simpler task than orchestration, fast execution needed
- **For 'medium'**: More thoughtful scoring, better quality assessment
- **For 'none'**: Fastest, minimal overhead

**Recommendation**: `reasoningEffort: 'low'`
- Balances speed and quality
- Evaluations don't need deep reasoning like orchestration
- Keeps latency reasonable

---

### 4. Token Limits

**Current**: `maxTokens: 1000`

**Analysis**:
- Evaluation output is structured scores + feedback
- 1000 tokens is sufficient for detailed feedback
- No need to change

**Decision**: Keep `maxTokens: 1000`

---

### 5. Deprecation Status

**Current**: Methods marked `@deprecated` but still functional

**Options**:
1. **Keep deprecated, just upgrade model** (Recommended)
   - Maintain backward compatibility
   - No API contract changes
   - Continue recommending LangSmith UI for new implementations
   
2. **Remove deprecation warning**
   - Signal that programmatic evaluation is supported
   - May confuse users about LangSmith UI recommendation

**Decision**: Keep `@deprecated` status, upgrade model internally

---

## Implementation Plan

### Phase 1: Code Changes

#### File: `src/lib/langchain.ts`

**Change 1: Update evaluateSummary() - Line 287-292**
```typescript
// BEFORE:
const evaluatorModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4o-mini',
  temperature: 0.2,
  maxTokens: 1000,
});

// AFTER:
const evaluatorModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-5.1',           // Upgraded model
  temperature: 0.2,                // Maintain consistency
  reasoningEffort: 'low',          // Light reasoning for fast evaluation
  maxTokens: 1000,
});
```

**Change 2: Update evaluateCollatedSummary() - Line 341-346**
```typescript
// Same changes as above
const evaluatorModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-5.1',
  temperature: 0.2,
  reasoningEffort: 'low',
  maxTokens: 1000,
});
```

**Change 3: Update method documentation**
```typescript
/**
 * Evaluate summary quality using LLM-as-a-judge (GPT-5.1)
 * @deprecated This method is deprecated. Use LangSmith UI evaluators instead.
 * 
 * Note: Uses GPT-5.1 with low reasoning effort for fast, consistent scoring.
 */
```

---

### Phase 2: Testing Strategy

#### 1. Unit Tests
**Goal**: Verify evaluator can be instantiated and called

**Test File**: `src/lib/__tests__/langchain.test.ts` (create if needed)

```typescript
describe('LLM-as-a-Judge with GPT-5.1', () => {
  it('should evaluate summary with GPT-5.1', async () => {
    const result = await langchainIntegration.evaluateSummary({
      title: 'Test Article',
      url: 'https://example.com',
      summary: 'This is a test summary about synthetic biology.'
    });
    
    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.overallScore).toBeLessThanOrEqual(1);
    expect(result.feedback).toBeTruthy();
  });
});
```

#### 2. Integration Tests
**Goal**: Compare GPT-5.1 vs gpt-4o-mini scores on same summaries

**Approach**:
1. Select 5-10 historical summaries
2. Evaluate with both models
3. Compare score distributions
4. Verify GPT-5.1 provides more nuanced feedback

**Success Criteria**:
- Scores remain in reasonable range (0-1)
- GPT-5.1 provides more detailed feedback
- No runtime errors or timeouts

#### 3. Manual Verification
**Test Cases**:
- **Good summary**: Should score 0.8+
- **Poor summary**: Should score 0.3-0.5
- **Edge cases**: Very short, very long, off-topic summaries

---

### Phase 3: Rollout Strategy

#### Option A: Direct Migration (Recommended)
**Approach**:
1. Update code to GPT-5.1
2. Run integration tests
3. Deploy to production
4. Monitor first 24 hours

**Pros**:
- Simple, clean migration
- Immediate quality improvement
- No dual-model complexity

**Cons**:
- No A/B comparison in production
- Can't easily compare old vs new scores

#### Option B: Gradual Migration with Feature Flag
**Approach**:
1. Add environment variable: `EVALUATOR_MODEL=gpt-5.1` (default: gpt-4o-mini)
2. Deploy with flag off
3. Enable for subset of evaluations
4. Compare results
5. Full rollout

**Pros**:
- Can A/B test in production
- Easy rollback
- Gradual confidence building

**Cons**:
- Added complexity
- Mixed evaluation scores in DB
- Requires flag management

**Recommendation**: **Option A** - Direct migration
- Evaluations are not customer-facing
- Risk is low (fallback to 0.5 on failure exists)
- Simpler implementation

---

### Phase 4: Monitoring & Validation

#### Metrics to Track (First Week)

1. **Score Distribution**
   - Track histogram of overall scores
   - Compare to historical baselines
   - Expected: More granular scoring (less clustering at 0.5, 0.7, 0.9)

2. **Latency**
   - Measure evaluation time
   - Expected: 10-20% increase due to reasoning_effort
   - Acceptable if < 5 seconds per evaluation

3. **API Errors**
   - Monitor OpenAI API failures
   - Track timeout rates
   - Set up alerts for >5% failure rate

4. **Cost**
   - Track daily evaluation costs
   - Compare to baseline
   - Expected: ~5-8x increase (still negligible)

5. **Quality Indicators**
   - Review feedback text quality
   - Check for more specific, actionable feedback
   - Validate scoring makes sense for known good/bad summaries

#### LangSmith Traces
- Tag evaluation calls: `['gpt-5.1-evaluation', 'llm-as-judge']`
- Monitor trace dashboard for:
  - Model calls showing `gpt-5.1`
  - `reasoningEffort: 'low'` parameter present
  - No tool calling attempts (evaluator shouldn't use tools)

---

## Risk Assessment & Mitigation

### Risk 1: Score Variance Increases
**Likelihood**: Medium  
**Impact**: Medium  
**Mitigation**: 
- Keep temperature at 0.2 for consistency
- Document baseline variance
- Consider averaging multiple evaluations if critical

### Risk 2: Latency Increase
**Likelihood**: High  
**Impact**: Low  
**Mitigation**:
- Use `reasoningEffort: 'low'` to minimize overhead
- Run evaluations asynchronously (already done)
- Set timeout at 30 seconds

### Risk 3: Cost Increase
**Likelihood**: High  
**Impact**: Very Low  
**Mitigation**:
- Projected cost increase: ~$3-5/month
- Set budget alerts at $20/month
- Can rate-limit evaluations if needed

### Risk 4: Temperature Constraint
**Likelihood**: Medium (GPT-5.1 may require temp=1)  
**Impact**: Medium  
**Mitigation**:
- Test with temp=0.2 first
- If API rejects, update to temp=1
- Document scoring variance baseline with temp=1
- Consider averaging scores across multiple runs

### Risk 5: Breaking Changes in SDK
**Likelihood**: Low (already on 6.9.0)  
**Impact**: Low  
**Mitigation**:
- SDK already updated in orchestration migration
- Type guards already in place
- Comprehensive test suite

---

## Rollback Plan

### Quick Rollback Option
```typescript
// In src/lib/langchain.ts, lines 287-292 and 341-346
const evaluatorModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4o-mini',  // ← Change back
  temperature: 0.2,
  // Remove reasoningEffort line
  maxTokens: 1000,
});
```

### Rollback Triggers
- Evaluation failure rate > 10%
- Average latency > 10 seconds
- Cost exceeds $50/month
- Scores become nonsensical (e.g., all 0 or all 1)

---

## Success Criteria

### Immediate (First Week)
- ✅ Zero deployment errors
- ✅ Evaluation API calls show `gpt-5.1` in traces
- ✅ Failure rate < 5%
- ✅ Latency < 8 seconds average

### Short-term (First Month)
- ✅ More detailed feedback text (subjective review)
- ✅ Score distribution shows more granularity
- ✅ No rollback required
- ✅ Cost within expected range ($3-10/month increase)

### Long-term (Ongoing)
- ✅ Evaluation quality improves summary iteration process
- ✅ Scores correlate with human judgment
- ✅ Feedback is actionable for prompt improvement

---

## Open Questions

1. **Should we make evaluator model configurable via env var?**
   - Pros: Easy experimentation, A/B testing
   - Cons: Added complexity
   - Recommendation: Not initially, can add later if needed

2. **Should we store model version with evaluation results?**
   - Pros: Historical tracking, model comparison
   - Cons: Schema change required
   - Recommendation: Yes, add `evaluator_model` field to evaluations table

3. **Should we remove @deprecated warnings?**
   - Recommendation: No, keep as deprecated but functional
   - LangSmith UI evaluators are still the preferred approach

4. **Do we need batch evaluation endpoint?**
   - Could optimize for bulk evaluation scenarios
   - Recommendation: Post-migration optimization

---

## Timeline

### Immediate (1-2 hours)
- Code changes to `langchain.ts`
- Update documentation strings
- Build verification

### Short-term (1 day)
- Integration testing with sample summaries
- Manual verification of scores
- Deploy to production

### Monitoring Period (1 week)
- Daily review of metrics
- Spot-check evaluation quality
- Fine-tune if needed

---

## Post-Migration Enhancements (Future)

1. **Structured Output**
   - Use GPT-5.1's JSON mode for structured scores
   - Eliminate regex parsing

2. **Multi-model Ensemble**
   - Average scores from multiple models
   - Reduce variance

3. **Custom Evaluation Rubrics**
   - Domain-specific scoring criteria
   - Weighted metrics for different use cases

4. **Real-time Evaluation UI**
   - Dashboard for evaluation trends
   - Quality regression detection

---

## Conclusion

Migrating LLM-as-a-judge to GPT-5.1 is a low-risk, high-reward upgrade that:
- Improves evaluation quality and consistency
- Aligns with the orchestration agent architecture
- Has minimal cost impact (~$3-5/month)
- Can be easily rolled back if issues arise

**Recommendation**: Proceed with migration using the direct rollout approach.

