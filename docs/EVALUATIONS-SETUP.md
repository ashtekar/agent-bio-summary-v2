# Human Evaluation and Grading System Setup Guide

## Overview

This document explains how to set up and use the human evaluation and grading system for article summaries.

## Database Setup

### Step 1: Create the Evaluations Table

Run the following SQL in your Supabase SQL Editor:

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

### Step 2: Set Up Row-Level Security (if enabled)

If you have RLS enabled, add policies:

```sql
-- Allow service role to read/write
CREATE POLICY "Service role full access" ON summary_evaluations
  FOR ALL USING (auth.role() = 'service_role');
```

## Features Implemented

### 1. Grading UI (`/grading`)

- **Access**: Available via email link "Rate This Summary" or directly at `/grading?email=<recipient_email>`
- **Features**:
  - Displays grading rubric with 4 criteria
  - Shows article title and link
  - Displays full summary text
  - 4 interactive sliders (1-10 scale) for each criterion
  - Optional text feedback (50 words max)
  - Auto-advances to next ungraded summary after submission
  - Mobile-friendly design (iPhone compatible)
  - Shows "All Done!" message when no more summaries available

### 2. Evaluations View (`/evaluations`)

- **Access**: New "?Evaluations" tab in navigation
- **Features**:
  - Table showing all evaluations
  - Columns: Grader name/email, 4 criteria scores, Summary ID, Date
  - Clickable Summary ID opens modal with full summary
  - Scores displayed on 1-10 scale (converted from stored 0-1)
  - Displays optional feedback if provided

### 3. API Routes

- **POST `/api/evaluations`**: Save a new evaluation
- **GET `/api/evaluations`**: Get evaluations (supports `summaryId` or `graderEmail` query params)
- **GET `/api/evaluations/next`**: Get next ungraded summary for a grader
- **GET `/api/summaries/[id]`**: Get a single summary by ID (for grading modal)

### 4. Email Integration

- Email template updated with "Rate This Summary" button
- Links to `/grading?email=<recipient_email>&name=<recipient_name>`
- Automatically finds next ungraded summary for the recipient

## Grading Criteria

1. **Simple terminology** (1-10): Does the summary have terminology that might be hard to understand?
2. **Clear concept explanation** (1-10): Does the summary explain the concept behind the article such that it's easy to understand?
3. **Clear explanation of methodology** (1-10): Does the summary explain the novel methods, practices and approaches used to come up with findings or conclusions?
4. **Balanced details** (1-10): Does the summary have enough & balanced details about the concept, methods, findings, conclusions and impact to engage?

## Score Normalization

- Scores are collected on a 1-10 scale for human readability
- Stored in database normalized to 0-1 (divided by 10) to align with machine scores (LLM-as-judge)
- Displayed back as 1-10 scale in the evaluations table

## Usage Flow

1. **Recipient receives email** with daily summary
2. **Clicks "Rate This Summary"** button
3. **Redirected to grading page** (`/grading?email=...`)
4. **System finds next ungraded summary** for that recipient
5. **Recipient grades summary** using 4 sliders
6. **Optionally provides feedback** (max 50 words)
7. **Submits evaluation** - automatically advances to next summary
8. **Continues until all summaries graded** or stops

## Multiple Graders

- Same summary can be graded by multiple recipients
- Each evaluation is stored separately with grader email
- Evaluations table shows all evaluations from all graders
- Unique constraint prevents duplicate evaluations from same grader

## Future Enhancements

- Store and display qualitative feedback in evaluations table
- Session management tied to validated email addresses
- Workflow to begin grading summaries programmatically
- Export evaluations to LangSmith for comparison with automated scores
