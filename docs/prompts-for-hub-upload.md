# Prompts for LangSmith Hub Upload

Copy/paste these prompts when uploading to LangSmith Hub via the web UI.

**Important**: Set all prompts to **Private** visibility!

---

## Prompt 1: Summarization

**Name**: `agent-bio-summary-v2/summarization`  
**Description**: `Summarize synthetic biology research articles for college sophomores`  
**Input Variables**: `title`, `url`, `content`  
**Tags**: `latest`, `bio-summary`, `synthetic-biology`  
**Visibility**: **Private**

**Template**:
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

---

## Prompt 2: Collation

**Name**: `agent-bio-summary-v2/collation`  
**Description**: `Collate individual article summaries into an HTML email newsletter`  
**Input Variables**: `summaries`  
**Tags**: `latest`, `bio-summary`, `synthetic-biology`  
**Visibility**: **Private**

**Template**:
```
Create a cohesive daily synthetic biology newsletter from these individual article summaries:

{summaries}

Requirements:
- Create an engaging newsletter format suitable for email
- Use HTML formatting for email compatibility
- Include article headings with links to original sources
- Maintain coherence across all articles
- Add a call-to-action for feedback at the end
- Keep it engaging for college sophomore biology students

Newsletter HTML:
```

---

## Prompt 3: Evaluation

**Name**: `agent-bio-summary-v2/evaluation`  
**Description**: `Evaluate the quality of an individual article summary using LLM-as-a-judge`  
**Input Variables**: `title`, `url`, `summary`  
**Tags**: `latest`, `bio-summary`, `llm-as-judge`  
**Visibility**: **Private**

**Template**:
```
Evaluate the quality of this article summary:

Article Title: {title}
Article URL: {url}
Summary: {summary}

Rate the following criteria on a scale of 0-1:
1. Coherence: Is the summary logically structured and easy to follow?
2. Accuracy: Does the summary accurately represent the article content?
3. Completeness: Does the summary cover the key points adequately?
4. Readability: Is the summary appropriate for college sophomore level?

Provide specific feedback and an overall score.
```

---

## Prompt 4: Collated Evaluation

**Name**: `agent-bio-summary-v2/collatedEvaluation`  
**Description**: `Evaluate the quality of the collated newsletter using LLM-as-a-judge`  
**Input Variables**: `count`, `summary`  
**Tags**: `latest`, `bio-summary`, `llm-as-judge`  
**Visibility**: **Private**

**Template**:
```
Evaluate the quality of this collated summary:

Individual Summaries Count: {count}
Collated Summary: {summary}

Rate the following criteria on a scale of 0-1:
1. Coherence: Does the summary flow logically across all articles?
2. Accuracy: Are the individual summaries accurately represented?
3. Completeness: Are all important articles included?
4. Readability: Is it appropriate for email newsletter format?

Provide specific feedback and an overall score.
```

---

## Prompt 5: Orchestration (Agent System Prompt)

**Name**: `agent-bio-summary-v2/orchestration`  
**Description**: `System prompt for LangChain agent orchestration - controls tool calling workflow`  
**Input Variables**: None (this is a system prompt)  
**Tags**: `latest`, `agent-orchestration`, `system-prompt`  
**Visibility**: **Private**

**Template**:
```
You are an expert AI agent for generating daily synthetic biology summaries.

Your task is to:
1. Search for recent synthetic biology articles
2. Extract, score, and store relevant articles (use extractScoreAndStoreArticles for efficiency)
3. Generate high-quality summaries (minimum 100 words each, MAX 2 articles per call)
4. Collate summaries into a cohesive HTML email newsletter
5. Send the final summary to specified email recipients

TOOL OPTIMIZATION:
- PREFERRED: Use 'extractScoreAndStoreArticles' after searchWeb - automatically reads search results from state, just pass relevancyThreshold
- searchWeb stores results in state automatically - DO NOT try to pass searchResults to the next tool
- LEGACY: Individual tools (extractArticles, scoreRelevancy, storeArticles) available for debugging

Key requirements:
- Focus on synthetic biology, biotechnology, and related fields
- Ensure summaries are appropriate for college sophomore level
- Generate HTML-formatted email content
- Include article links and citations
- Maintain professional tone and accuracy
```

---

## Upload Checklist

Use this checklist to ensure all prompts are uploaded correctly:

- [ ] Prompt 1: `agent-bio-summary-v2/summarization` - Private
- [ ] Prompt 2: `agent-bio-summary-v2/collation` - Private
- [ ] Prompt 3: `agent-bio-summary-v2/evaluation` - Private
- [ ] Prompt 4: `agent-bio-summary-v2/collatedEvaluation` - Private
- [ ] Prompt 5: `agent-bio-summary-v2/orchestration` - Private ⭐ NEW

After uploading all 5, update your `.env.local`:
```bash
PROMPT_SOURCE=hub
PROMPT_VERSION=latest
PROMPT_CACHE_TTL=600
```

Then test with:
```bash
npm run dev
```

Look for this in the logs:
```
📥 Fetching prompts from LangSmith Hub...
  ↓ Fetching: agent-bio-summary-v2/summarization:latest
  ✓ Loaded: summarization
  ↓ Fetching: agent-bio-summary-v2/collation:latest
  ✓ Loaded: collation
  ↓ Fetching: agent-bio-summary-v2/evaluation:latest
  ✓ Loaded: evaluation
  ↓ Fetching: agent-bio-summary-v2/collatedEvaluation:latest
  ✓ Loaded: collatedEvaluation
  ↓ Fetching: agent-bio-summary-v2/orchestration:latest
  ✓ Loaded: orchestration
✅ All prompts loaded from Hub successfully
```

---

## Quick Reference URLs

- **LangSmith Hub**: https://smith.langchain.com/hub
- **Your Prompts**: https://smith.langchain.com/hub?owner=your-username
- **LangSmith Dashboard**: https://smith.langchain.com/

---

**Pro Tip**: Keep this file open in one window and the LangSmith Hub in another for easy copy/paste!

