# Prompt Hub Setup Guide

## Overview

This guide explains how to migrate your prompts from hardcoded values to LangSmith Hub for better version control, A/B testing, and team collaboration.

## Benefits

- ✅ Update prompts without code deployments
- ✅ Version control for prompt iterations
- ✅ A/B test different prompt variations
- ✅ Team collaboration on prompt improvements
- ✅ Centralized prompt management

## Prerequisites

1. **LangSmith Account**: https://smith.langchain.com
2. **LangChain API Key**: Available in LangSmith Settings > API Keys
3. **Node.js/npm**: Already installed (for TypeScript script)

## Step 1: Go to LangSmith Hub

1. Visit: https://smith.langchain.com/hub
2. Log in with your LangChain account
3. Click the **"+ New Prompt"** button (top right)

## Step 2: Create Prompts (One at a Time)

**📋 Quick Reference**: All prompt templates are in `docs/prompts-for-hub-upload.md` for easy copy/paste!

You'll create 4 prompts. For each one, follow this process:

### Prompt 1: Summarization

1. **Click "+ New Prompt"**
2. **Fill in the form:**
   - **Name**: `agent-bio-summary-v2/summarization`
   - **Description**: `Summarize synthetic biology research articles for college sophomores`
   - **Visibility**: **Private** ⚠️ (Important!)
   - **Type**: Prompt Template

3. **Copy the prompt template** from `docs/prompts-for-hub-upload.md` (Prompt 1 section):
   ```
   You are an expert in synthetic biology and biotechnology. Create a comprehensive summary of this research article for college sophomores studying biology.

   Article Title: {title}
   Article URL: {url}
   Article Content: {content}

   Requirements:
   - Minimum 100 words
   - Focus on synthetic biology relevance
   - Use clear, accessible language
   - Highlight key findings and implications
   - Include any practical applications mentioned
   - Explain technical concepts for college sophomore level

   Summary:
   ```

4. **Set Input Variables**: `title`, `url`, `content`
5. **Add Tags**: `latest`, `bio-summary`, `synthetic-biology`
6. **Click "Commit"** to save

### Prompt 2: Collation

Repeat the process:
- **Name**: `agent-bio-summary-v2/collation`
- **Description**: `Collate individual article summaries into an HTML email newsletter`
- **Template**: See `docs/prompts-for-hub-upload.md` (Prompt 2 section)
- **Input Variables**: `summaries`
- **Tags**: `latest`, `bio-summary`
- **Visibility**: Private

### Prompt 3: Evaluation

- **Name**: `agent-bio-summary-v2/evaluation`
- **Description**: `Evaluate the quality of an individual article summary using LLM-as-a-judge`
- **Template**: See `docs/prompts-for-hub-upload.md` (Prompt 3 section)
- **Input Variables**: `title`, `url`, `summary`
- **Tags**: `latest`, `bio-summary`, `llm-as-judge`
- **Visibility**: Private

### Prompt 4: Collated Evaluation

- **Name**: `agent-bio-summary-v2/collatedEvaluation`
- **Description**: `Evaluate the quality of the collated newsletter using LLM-as-a-judge`
- **Template**: See `docs/prompts-for-hub-upload.md` (Prompt 4 section)
- **Input Variables**: `count`, `summary`
- **Tags**: `latest`, `bio-summary`, `llm-as-judge`
- **Visibility**: Private

## Step 3: Configure Your Application

### For Local Development

Update `.env.local`:
```bash
PROMPT_SOURCE=hub
PROMPT_VERSION=latest
PROMPT_CACHE_TTL=600
```

### For Vercel Production

Add environment variables in Vercel dashboard:
1. Go to Project Settings > Environment Variables
2. Add:
   - `PROMPT_SOURCE` = `hub`
   - `PROMPT_VERSION` = `latest`
   - `PROMPT_CACHE_TTL` = `600`

## Step 4: Test the Integration

### Option A: Run Tests
```bash
npm test -- src/__tests__/langchain-agent.test.ts
```

### Option B: Start Dev Server
```bash
npm run dev
```

Check console logs for:
```
📥 Fetching prompts from LangSmith Hub...
  ↓ Fetching: agent-bio-summary-v2/summarization:latest
  ✓ Loaded: summarization
  ...
✅ All prompts loaded from Hub successfully
```

## Step 5: View Your Prompts

Visit LangSmith Hub:
```
https://smith.langchain.com/hub
```

Filter by your prompts:
- `agent-bio-summary-v2/summarization`
- `agent-bio-summary-v2/collation`
- `agent-bio-summary-v2/evaluation`
- `agent-bio-summary-v2/collatedEvaluation`

## Updating Prompts

### Method 1: Via Web UI
1. Go to https://smith.langchain.com/hub
2. Find your prompt
3. Click "Edit"
4. Make changes
5. Commit with a new version tag (e.g., `v1.1`)
6. Update `PROMPT_VERSION` in your env vars

### Method 2: Upload New Version
1. Create a new version in the web UI
2. Update the prompt template
3. Commit with a new tag (e.g., `v1.1`, `v2`)
4. Update `PROMPT_VERSION` in your environment variables to use the new version

## Rollback to Local Prompts

If you need to revert to hardcoded prompts:

1. Update environment variables:
   ```bash
   PROMPT_SOURCE=local
   ```

2. Restart your application

The system will automatically fall back to hardcoded prompts.

## Caching Behavior

- **Cache Duration**: 600 seconds (10 minutes) by default
- **Cache Location**: In-memory per server instance
- **Cache Invalidation**: Automatic after TTL expires
- **Cold Start**: Fetches from Hub on first request

To adjust cache duration, change `PROMPT_CACHE_TTL` (in seconds).

## Troubleshooting

### Error: "LANGCHAIN_API_KEY environment variable not set"
**Solution**: Export your API key:
```bash
export LANGCHAIN_API_KEY='lsv2_sk_...'
```

### Error: "Failed to fetch {prompt} from hub"
**Possible causes:**
- Prompt doesn't exist in Hub
- Incorrect naming convention
- Network issues
- Invalid API key

**Solution**: Check:
1. Prompt exists at https://smith.langchain.com/hub
2. Naming matches: `agent-bio-summary-v2/{name}:{version}`
3. API key is valid

### Logs show "Using fallback local prompts"
This is normal if:
- `PROMPT_SOURCE=local` (intended behavior)
- Hub fetch failed (fallback protection)

Check logs for specific error messages.

## Versioning Strategy

### Recommended Approach:
1. **Development**: Use `latest` tag
2. **Staging**: Use specific versions like `v1.0`, `v1.1`
3. **Production**: Use tested version tags, avoid `latest`

### Version Format:
- `latest` - Always points to newest version
- `v1`, `v2`, `v3` - Major versions
- `v1.0`, `v1.1`, `v1.2` - Minor iterations
- `experimental` - Testing new variations

## A/B Testing (Future Enhancement)

The infrastructure supports A/B testing:

```typescript
// Future: Randomly select prompt version
const version = Math.random() < 0.5 ? 'v1' : 'v2';
process.env.PROMPT_VERSION = version;
```

Track which version was used in your traces for analysis.

## Best Practices

1. **Always test locally** before deploying prompt changes
2. **Use version tags** instead of always using `latest` in production
3. **Keep prompts private** unless you want to share them publicly
4. **Document changes** in commit messages when updating prompts
5. **Monitor quality scores** after prompt updates to ensure improvements
6. **Keep fallback prompts** updated in code for reliability

## Security Notes

- Prompts are **private by default** - only you can see them
- API key should be kept secret (already in `.env.local`, git-ignored)
- Never commit API keys to version control
- Rotate API keys periodically for security

## Support

For issues or questions:
1. Check LangSmith documentation: https://docs.smith.langchain.com
2. Review LangChain Hub docs: https://docs.langchain.com/docs/langsmith/hub
3. Check application logs for specific error messages

---

**Last Updated**: Week 4 - Prompt Hub Migration
**Status**: ✅ Ready for Production

