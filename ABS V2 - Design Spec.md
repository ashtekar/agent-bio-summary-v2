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

## 3. Langchain Integration

```typescript
// Langchain for prompts and tracing
interface LangchainConfig {
  prompts: {
    searchPrompt: string
    extractPrompt: string
    scorePrompt: string
    summarizePrompt: string
    collatePrompt: string
    emailPrompt: string
  }
  tracing: {
    enabled: boolean
    annotations: boolean
    evalLLM: string
  }
  reinforcementLearning: {
    enabled: boolean
    gradingModel: string
    fineTuningEnabled: boolean
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

## 5. Error Handling & Tracing

- **Langchain Tracing**: All agent actions will be traced
- **Graceful Exit**: Failed tool calls will be logged and the agent will exit gracefully
- **Annotations**: LLM-as-a-judge will grade agent performance
- **Reinforcement Learning**: Pass/fail grades will be used for fine-tuning

## 6. Key Differences from V1

| Aspect | V1 (Current) | V2 (Agentic) |
|--------|--------------|--------------|
| **Flow** | Linear process | Agent with tool calls |
| **Prompts** | Hardcoded in code | Stored in Langchain |
| **Tracing** | Basic logging | Full Langchain tracing |
| **Learning** | None | RL with LLM-as-a-judge |
| **Error Handling** | Try/catch blocks | Graceful agent exits |
| **Modularity** | Monolithic functions | Separate tool functions |

## 7. Dependencies to Add

```json
{
  "dependencies": {
    "@openai/agent-sdk": "^latest",
    "langchain": "^latest",
    "@langchain/openai": "^latest",
    "@langchain/core": "^latest"
  }
}
```

## 8. Agent Context Elaboration

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

## 9. Tool Optimization for Cost, Latency & Throughput

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

