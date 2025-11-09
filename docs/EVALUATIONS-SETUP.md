# Human Evaluation and Grading System Setup Guide

## Overview

This document explains how to set up and use the human evaluation and grading system for article summaries.

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
