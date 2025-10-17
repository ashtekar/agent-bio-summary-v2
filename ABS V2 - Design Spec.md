# Agent Bio Summary V2 - Design Specification

## Architecture Overview

The agentic version will maintain the same web interface and database structure but replace the core daily summary generation flow with an OpenAI Agent SDK-based approach using tool calls.

## Key Components Analysis

### Current Implementation (V1)
- **Web Interface**: Next.js with React components (Dashboard, Settings, Feedback, etc.)
- **Database**: Supabase with tables for recipients, settings, articles, summaries, feedback
- **Core Flow**: Linear process in `daily-summary/route.ts`
- **Email Service**: Resend.io integration with HTML templates
- **Search**: Google Custom Search API with site-specific handlers
- **Summarization**: Direct OpenAI API calls

### New Agentic Implementation (V2)

## 1. Agent Architecture

```typescript
// New agent structure using OpenAI Agent SDK
interface BioSummaryAgent {
  tools: {
    searchWeb: SearchWebTool
    extractArticles: ExtractArticlesTool  
    scoreRelevancy: ScoreRelevancyTool
    storeArticles: StoreArticlesTool
    summarizeArticle: SummarizeArticleTool
    collateSummary: CollateSummaryTool
    sendEmail: SendEmailTool
  }
  context: AgentContext
  langchain: LangchainIntegration
}
```

## 2. Tool Call Sequence

Each tool will be a separate function call:

1. **`searchWeb`** - Search using provided URLs and search settings
2. **`extractArticles`** - Extract articles based on time window and article count
3. **`scoreRelevancy`** - Score articles using existing relevancy algorithm
4. **`storeArticles`** - Store articles above threshold (max 10) in Supabase
5. **`summarizeArticle`** - Generate 100+ word summary for each article
6. **`collateSummary`** - Combine summaries into HTML email format
7. **`sendEmail`** - Send via Resend.io to recipients

## 3. Langchain Integration ✅ **IMPLEMENTED**

```typescript
// Langchain for prompts, tracing, and evaluations
interface LangchainIntegration {
  // LangSmith Client for tracing and annotations
  client: Client  // ✅ Implemented
  
  // Prompts (currently hardcoded, migrating to Hub in Week 4)
  prompts: {
    summarization: PromptTemplate  // ✅ Implemented
    collation: PromptTemplate      // ✅ Implemented
    evaluation: PromptTemplate     // ✅ Implemented (LLM-as-a-judge)
    collatedEvaluation: PromptTemplate  // ✅ Implemented
  }
  
  // Tracing (LangSmith integration)
  tracing: {
    enabled: boolean  // ✅ LANGCHAIN_TRACING_V2=true
    workspaceId: string  // ✅ 8fcc7411-b8d8-4b1e-bb67-59ba217b2fa4
    project: string  // ✅ agent-bio-summary-v2
    annotations: boolean  // ✅ Implemented - eval scores linked to traces
  }
  
  // LLM-as-a-Judge Evaluation
  evaluation: {
    enabled: boolean  // ✅ Runs on every summary
    evalModel: 'gpt-4o-mini'  // ✅ Cost-optimized
    metrics: ['coherence', 'accuracy', 'completeness', 'readability']  // ✅ 4 metrics
    threshold: 0.5  // ✅ Pass/fail threshold
    cost: '$0.20/month'  // ✅ For ~10 articles/day
  }
}
```

## 4. Database Schema (Copied from V1)

All existing tables will be copied to the new Supabase project:
- `email_recipients`
- `search_settings` 
- `system_settings`
- `articles`
- `daily_summaries`
- `feedback`
- `search_sites`
- `feedback_comparisons`

## 5. Error Handling & Tracing ✅ **IMPLEMENTED**

### LangSmith Tracing 
- ✅ **All Tool Executions Traced**: searchWeb, extract, score, store, email
- ✅ **LangChain Auto-Tracing**: Summarization and collation chains automatically traced
- ✅ **Evaluation Tracing**: LLM-as-a-judge evaluations traced with GPT-4o-mini
- ✅ **Annotations**: Quality scores (0-1 scale) linked to summary traces
- ✅ **Metadata**: Duration, inputs, outputs, success/failure for all operations
- ✅ **Graceful Degradation**: Tracing failures don't break tool execution
- ⏳ **Hierarchical Traces**: Coming in Week 3 (LangChain Agent migration)

### Error Handling
- **Graceful Exit**: Failed tool calls logged and agent exits gracefully
- **Retry Logic**: Agent retries up to 10 iterations
- **Fallback Content**: Failed extractions use snippets instead of aborting
- **Quality Filtering**: Low-quality summaries (score < 0.5) filtered out

### Quality Assurance
- **LLM-as-a-Judge**: Every summary evaluated on 4 metrics
- **Pass/Fail Annotations**: Scores >= 0.5 marked as 'pass', < 0.5 as 'fail'
- **Cost Efficient**: GPT-4o-mini for evaluations (~$0.0003 per eval)
- **Dashboard Visibility**: All scores visible in LangSmith with trends over time

## 6. Key Differences from V1

| Aspect | V1 (Current) | V2 (Agentic - Current State) | V2 (Future) |
|--------|--------------|------------------------------|----------------------|
| **Flow** | Linear process | Agent with tool calls (OpenAI SDK) | LangChain AgentExecutor |
| **Prompts** | Hardcoded in code | LangChain PromptTemplate (hardcoded) | LangSmith Prompt Hub |
| **Tracing** | Basic logging (259 console.log) | ✅ Full LangSmith tracing | ✅ + Hierarchical traces |
| **Evaluation** | None | ✅ LLM-as-a-judge (GPT-4o-mini, 4 metrics) | ✅ + Human feedback loop |
| **Annotations** | None | ✅ Eval scores linked to traces | ✅ + A/B test results |
| **Error Handling** | Try/catch blocks | Graceful agent exits + trace logging | Auto-retry + better recovery |
| **Modularity** | Monolithic functions | ✅ Separate tool classes | ✅ + DynamicStructuredTool |
| **Observability** | Console logs only | ✅ LangSmith dashboard | ✅ + Quality dashboards |
| **Cost Tracking** | Manual estimation | ✅ Automatic per operation | ✅ + Trend analysis |


### ✅ Already Added 
```json
{
  "dependencies": {
    "openai": "^4.x.x",           // OpenAI SDK (LangChain uses this)
    "langchain": "^0.3.x",        // ✅ Installed
    "@langchain/openai": "^0.3.x", // ✅ Installed
    "@langchain/core": "^0.3.x",   // ✅ Installed
    "langsmith": "^0.2.x"          // ✅ Installed (Week 1)
  }
}
```

### ⏳ To Add in Week 3
```json
{
  "dependencies": {
    "zod": "^3.22.0",                    // Input validation for tools
    "@langchain/langgraph": "^0.0.20"    // Optional: Advanced agent workflows
  }
}
```

**Note:** LangChain wraps OpenAI SDK (doesn't replace it). All OpenAI models, API keys, and SDK remain in use.

## 7. Agent Context Elaboration

The agent will maintain context between tool calls including:

### Persistent Context
- **User Settings**: Search preferences, email recipients, system configuration
- **Session State**: Current run ID, timestamp, error tracking
- **Configuration**: Model settings, API keys, thresholds

### Dynamic Context
- **Search Results**: Articles found, relevance scores, filtering status
- **Processing State**: Which articles are being processed, completion status
- **Summary State**: Generated summaries, collation progress
- **Email State**: Recipients, sending status, error handling

### Context Flow
```typescript
interface AgentContext {
  // Initial context from database
  searchSettings: SearchSettings
  systemSettings: SystemSettings
  recipients: EmailRecipient[]
  
  // Runtime context
  sessionId: string
  startTime: Date
  currentStep: string
  
  // Processing context
  foundArticles: Article[]
  filteredArticles: Article[]
  storedArticles: Article[]
  summaries: ArticleSummary[]
  finalSummary: string
  
  // Error context
  errors: Error[]
  retryCount: number
  lastSuccessfulStep: string
}
```

This context allows the agent to:
- Resume from failed steps
- Maintain state across tool calls
- Provide detailed error reporting
- Track progress for monitoring
- Enable debugging and optimization

## 8. Tool Optimization for Cost, Latency & Throughput

### Combined Tools Strategy
1. **Search + Extract**: Combine web search and article extraction to reduce API calls
2. **Score + Store**: Combine relevancy scoring with database storage
3. **Summarize + Collate**: Batch article summarization with final collation

### Cost Optimization
- Batch API calls where possible
- Use streaming for large responses
- Implement caching for repeated operations
- Optimize token usage in prompts

### Latency Optimization
- Parallel processing where possible
- Async operations for I/O
- Connection pooling for database
- Efficient data structures

### Throughput Optimization
- Concurrent tool execution
- Queue management for high volume
- Resource pooling
- Performance monitoring

