# Evaluations Database Schema

## Overview

This document defines the database schema for storing human evaluations of article summaries. Multiple graders can evaluate the same summary, so evaluations are stored in a separate table.

## Table: `summary_evaluations`

Stores human evaluations of article summaries with 4 criteria (1-10 scale, normalized to 0-1).

```sql
CREATE TABLE summary_evaluations (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Links
  summary_id UUID NOT NULL REFERENCES article_summaries(id) ON DELETE CASCADE,
  
  -- Grader information
  grader_email VARCHAR(255) NOT NULL,
  grader_name VARCHAR(255), -- Optional name if available
  
  -- Evaluation scores (1-10 scale, stored as 0-1 after normalization)
  simple_terminology DECIMAL(3,2) NOT NULL CHECK (simple_terminology >= 0 AND simple_terminology <= 1),
  clear_concept DECIMAL(3,2) NOT NULL CHECK (clear_concept >= 0 AND clear_concept <= 1),
  clear_methodology DECIMAL(3,2) NOT NULL CHECK (clear_methodology >= 0 AND clear_methodology <= 1),
  balanced_details DECIMAL(3,2) NOT NULL CHECK (balanced_details >= 0 AND balanced_details <= 1),
  
  -- Optional qualitative feedback (not stored in this version, but schema supports it for future)
  feedback TEXT, -- Limited to 50 words (enforced by application, not DB)
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT summary_evaluations_unique UNIQUE (summary_id, grader_email)
);

-- Indexes for fast queries
CREATE INDEX idx_summary_evaluations_summary ON summary_evaluations(summary_id);
CREATE INDEX idx_summary_evaluations_grader ON summary_evaluations(grader_email);
CREATE INDEX idx_summary_evaluations_created ON summary_evaluations(created_at DESC);
```

## Evaluation Criteria

1. **Simple terminology** (0-1): Does the summary have terminology that might be hard to understand?
2. **Clear concept explanation** (0-1): Does the summary explain the concept behind the article such that it's easy to understand?
3. **Clear explanation of methodology** (0-1): Does the summary explain the novel methods, practices and approaches used to come up with findings or conclusions?
4. **Balanced details** (0-1): Does the summary have enough & balanced details about the concept, methods, findings, conclusions and impact to engage?

## Usage Examples

### Save Evaluation

```typescript
await evaluationService.saveEvaluation({
  summaryId: 'summary_123',
  graderEmail: 'recipient@example.com',
  graderName: 'John Doe', // Optional
  simpleTerminology: 0.8, // Normalized from 8/10
  clearConcept: 0.9, // Normalized from 9/10
  clearMethodology: 0.7, // Normalized from 7/10
  balancedDetails: 0.85, // Normalized from 8.5/10
  feedback: 'Good summary, but could use more details on methodology.' // Optional, max 50 words
});
```

### Get All Evaluations for a Summary

```typescript
const evaluations = await evaluationService.getEvaluationsBySummary('summary_123');
```

### Get All Evaluations by Grader

```typescript
const evaluations = await evaluationService.getEvaluationsByGrader('recipient@example.com');
```

### Get All Evaluations (for table view)

```typescript
const evaluations = await evaluationService.getAllEvaluations();
```

## Relationship Diagram

```
article_summaries (id)
    ??? summary_evaluations (summary_id) ? 1:many
```

## Migration Steps

1. Run the CREATE TABLE statement above in your Supabase SQL editor.
2. Verify with: `SELECT * FROM summary_evaluations;`

## Row-Level Security (RLS)

If you have RLS enabled, add policies:

```sql
-- Allow service role to read/write
CREATE POLICY "Service role full access" ON summary_evaluations
  FOR ALL USING (auth.role() = 'service_role');
```

## Normalization

Scores are collected on a 1-10 scale from the UI for human readability, but stored normalized to 0-1 by dividing by 10 to align with machine scores (LLM-as-judge).
