# Agent Bio Summary V2 - LLM-Driven Architecture Diagram

## 🏗️ System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        UI[Web UI/Dashboard]
        API_CLIENT[API Client]
    end
    
    subgraph "API Layer"
        API_ROUTE["/api/daily-summary"]
        SETTINGS_API["/api/settings"]
    end
    
    subgraph "Agent Layer"
        LLM_AGENT[LLMDrivenBioSummaryAgent]
        OPENAI[OpenAI Models]
    end
    
    subgraph "Settings Layer"
        SETTINGS_SERVICE[SettingsService]
    end
    
    subgraph "Tool Layer"
        SEARCH_TOOLS[SearchTools]
        PROCESSING_TOOLS[ProcessingTools]
        SUMMARY_TOOLS[SummaryTools]
        EMAIL_TOOLS[EmailTools]
        TOOL_STATE[("Tool State Manager")]
    end
    
    subgraph "External Services"
        GOOGLE_SEARCH[Google Custom Search API]
        SUPABASE[("Supabase Database")]
        RESEND[Resend.io Email]
        LANGCHAIN[Langchain/LangSmith]
    end
    
    subgraph "Observability"
        LANGSMITH[("LangSmith Tracing")]
        ANNOTATIONS[Quality Annotations]
    end
    
    UI --> API_CLIENT
    API_CLIENT --> API_ROUTE
    API_CLIENT --> SETTINGS_API
    API_ROUTE --> SETTINGS_SERVICE
    SETTINGS_API --> SETTINGS_SERVICE
    SETTINGS_SERVICE --> SUPABASE
    API_ROUTE --> LLM_AGENT
    LLM_AGENT --> OPENAI
    OPENAI --> LLM_AGENT
    
    LLM_AGENT --> SEARCH_TOOLS
    LLM_AGENT --> PROCESSING_TOOLS
    LLM_AGENT --> SUMMARY_TOOLS
    LLM_AGENT --> EMAIL_TOOLS
    
    SEARCH_TOOLS --> GOOGLE_SEARCH
    SEARCH_TOOLS --> TOOL_STATE
    PROCESSING_TOOLS --> TOOL_STATE
    PROCESSING_TOOLS --> SUPABASE
    SUMMARY_TOOLS --> LANGCHAIN
    EMAIL_TOOLS --> RESEND
    
    LLM_AGENT --> LANGCHAIN
    
    SEARCH_TOOLS -.-> LANGSMITH
    PROCESSING_TOOLS -.-> LANGSMITH
    SUMMARY_TOOLS -.-> LANGSMITH
    EMAIL_TOOLS -.-> LANGSMITH
    LANGCHAIN -.-> LANGSMITH
    LANGSMITH --> ANNOTATIONS
```

## 🔄 LLM-Driven Execution Flow

```mermaid
sequenceDiagram
    participant Client
    participant API as "API Route"
    participant Settings as "SettingsService"
    participant Agent as "LLMDrivenBioSummaryAgent"
    participant LLM as "OpenAI Models"
    participant Tools as "Tool Layer"
    participant External as "External Services"
    
    Client->>API: POST /api/daily-summary
    API->>Settings: Load settings from Supabase
    Settings->>API: Return model configuration
    API->>Agent: Create agent with context + model config
    Agent->>LLM: Send system prompt + context (using configured model)
    
    loop LLM Decision Loop
        LLM->>Agent: Return tool calls or completion
        alt Tool Calls Requested
            Agent->>Tools: Execute requested tools
            Tools->>External: Call external APIs
            External-->>Tools: Return results
            Tools-->>Agent: Return tool results
            Agent->>Agent: Update context
            Agent->>LLM: Send tool results
        else Task Complete: (Agent has final answer)
            Agent->>API: Return final result
        end
    end
    
    API->>Client: Return response
```

## 🛠️ Tool Execution Flow

```mermaid
graph TD
    START([User Request]) --> INIT[Initialize Agent Context]
    INIT --> LLM_START[LLM Analyzes Context]
    
    LLM_START --> DECISION{LLM Decides Next Action}
    
    DECISION -->|searchWeb| SEARCH[Search Web Tool]
    DECISION -->|extractArticles| EXTRACT[Extract Articles Tool]
    DECISION -->|scoreRelevancy| SCORE[Score Relevancy Tool]
    DECISION -->|storeArticles| STORE[Store Articles Tool]
    DECISION -->|summarizeArticle| SUMMARIZE[Summarize Article Tool]
    DECISION -->|collateSummary| COLLATE[Collate Summary Tool]
    DECISION -->|sendEmail| EMAIL[Send Email Tool]
    DECISION -->|Complete| COMPLETE[Task Complete]
    
    SEARCH --> UPDATE_CONTEXT[Update Context]
    EXTRACT --> UPDATE_CONTEXT
    SCORE --> UPDATE_CONTEXT
    STORE --> UPDATE_CONTEXT
    SUMMARIZE --> UPDATE_CONTEXT
    COLLATE --> UPDATE_CONTEXT
    EMAIL --> UPDATE_CONTEXT
    
    UPDATE_CONTEXT --> CHECK{Task Complete?}
    CHECK -->|No| ITERATION{Max Iterations?}
    CHECK -->|Yes| COMPLETE
    
    ITERATION -->|No| LLM_START
    ITERATION -->|Yes| TIMEOUT[Timeout/Error]
    
    COMPLETE --> SUCCESS([Success Response])
    TIMEOUT --> FAILURE([Failure Response])
```

## 🧠 LLM Decision Making Process

```mermaid
graph LR
    subgraph "Context Analysis"
        SEARCH_SETTINGS[Search Settings]
        SYSTEM_SETTINGS[System Settings]
        MODEL_CONFIG[Model Configuration]
        RECIPIENTS[Email Recipients]
        CURRENT_STATE[Current Execution State]
    end
    
    subgraph "LLM Processing"
        ANALYZE[Analyze Context]
        DECIDE[Decide Next Tool]
        PARAMETERS[Generate Parameters]
    end
    
    subgraph "Available Tools"
        TOOL1[searchWeb]
        TOOL2[extractArticles]
        TOOL3[scoreRelevancy]
        TOOL4[storeArticles]
        TOOL5[summarizeArticle]
        TOOL6[collateSummary]
        TOOL7[sendEmail]
    end
    
    SEARCH_SETTINGS --> ANALYZE
    SYSTEM_SETTINGS --> ANALYZE
    MODEL_CONFIG --> ANALYZE
    RECIPIENTS --> ANALYZE
    CURRENT_STATE --> ANALYZE
    
    ANALYZE --> DECIDE
    DECIDE --> PARAMETERS
    
    PARAMETERS --> TOOL1
    PARAMETERS --> TOOL2
    PARAMETERS --> TOOL3
    PARAMETERS --> TOOL4
    PARAMETERS --> TOOL5
    PARAMETERS --> TOOL6
    PARAMETERS --> TOOL7
```

## 📊 Data Flow Architecture

```mermaid
graph TB
    subgraph "Input Data"
        SEARCH_CONFIG[Search Configuration]
        SYSTEM_CONFIG[System Configuration]
        MODEL_CONFIG[Model Configuration]
        USER_PREFS[User Preferences]
    end
    
    subgraph "Processing Pipeline"
        ARTICLES[Raw Articles]
        FILTERED[Filtered Articles]
        SUMMARIES[Article Summaries]
        FINAL_SUMMARY[Final Collated Summary]
    end
    
    subgraph "Output Data"
        EMAIL_CONTENT[HTML Email Content]
        TRACES[Execution Traces]
        METRICS[Performance Metrics]
    end
    
    SEARCH_CONFIG --> ARTICLES
    SYSTEM_CONFIG --> FILTERED
    MODEL_CONFIG --> SUMMARIES
    USER_PREFS --> SUMMARIES
    
    ARTICLES --> FILTERED
    FILTERED --> SUMMARIES
    SUMMARIES --> FINAL_SUMMARY
    
    FINAL_SUMMARY --> EMAIL_CONTENT
    FINAL_SUMMARY --> TRACES
    FINAL_SUMMARY --> METRICS
```

## 🔧 Component Interaction Details

```mermaid
graph LR
    subgraph "LLMDrivenBioSummaryAgent"
        CONTEXT[Agent Context]
        ITERATION[Iteration Control]
        ERROR_HANDLER[Error Handler]
    end
    
    subgraph "Tool Definitions"
        TOOL_DEFS[Function Definitions]
        PARAM_SCHEMAS[Parameter Schemas]
    end
    
    subgraph "Tool Execution"
        TOOL_ROUTER[Tool Router]
        RESULT_PROCESSOR[Result Processor]
    end
    
    subgraph "External Integrations"
        GOOGLE[Google Search]
        DB[("Supabase")]
        EMAIL[Resend.io]
        LANGCHAIN[Langchain]
    end
    
    CONTEXT --> TOOL_DEFS
    ITERATION --> TOOL_ROUTER
    ERROR_HANDLER --> RESULT_PROCESSOR
    
    TOOL_ROUTER --> GOOGLE
    TOOL_ROUTER --> DB
    TOOL_ROUTER --> EMAIL
    TOOL_ROUTER --> LANGCHAIN
    
    RESULT_PROCESSOR --> CONTEXT
```

## 🚀 Key Architectural Features

### **1. LLM-Driven Decision Making**
- Configurable OpenAI models make intelligent decisions about tool sequence
- Context-aware execution based on current state and model configuration
- Dynamic adaptation to different scenarios
- Model selection from Supabase settings

### **2. Tool Abstraction Layer**
- Clean separation between LLM decisions and tool execution
- Standardized tool interface with OpenAI function definitions
- Type-safe parameter validation

### **3. Context Management**
- Persistent context throughout execution
- State tracking for each processing step
- Error recovery and retry mechanisms

### **4. External Service Integration**
- Google Custom Search for article discovery (with pagination support)
- Supabase for data persistence and model configuration
- Resend.io for email delivery
- Langchain for advanced LLM operations

### **5. Configurable Model System**
- Dynamic model selection from Supabase settings
- Temperature and token limit configuration
- Fallback to default settings if database unavailable
- Support for multiple OpenAI models (GPT-4o, GPT-4o-mini, etc.)

### **6. State Management for Tools**
- Session-based in-memory state cache
- Enables data sharing between tools without token overhead
- Prevents JSON truncation errors with large payloads (100+ search results)
- Automatic cleanup on completion/error
- Isolated state per execution session

### **7. Monitoring & Observability**
- Comprehensive logging at each step
- Session tracking and execution metrics
- Error tracking and recovery logging

## 📈 Performance Characteristics

- **Execution Time**: 30-60 seconds per summary (varies by model)
- **Cost**: ~$0.02-0.50 per execution (configurable via model selection)
  - Evaluation cost: +$0.20/month for ~10 articles/day
- **Success Rate**: High with proper API configuration
- **Scalability**: Horizontal scaling via stateless design
- **Reliability**: Built-in error handling and retry logic
- **Model Flexibility**: Dynamic model selection for cost/quality optimization

## 🔍 Observability Architecture (Week 1 & 2 - Implemented)

### LangSmith Integration
```
All Operations → LangSmith Tracing
├── Tool Executions (Custom TracingWrapper)
│   ├── searchWeb: query, results, duration
│   ├── extractArticles: article count, extraction time
│   ├── scoreRelevancy: threshold, relevant count
│   ├── storeArticles: database operations
│   └── sendEmail: recipients, delivery status
│
└── LangChain Operations (Auto-Traced)
    ├── Summarization: article → summary (GPT-4o)
    ├── Collation: summaries → newsletter (GPT-4o)
    ├── Evaluation: summary → quality score (GPT-4o-mini)
    └── Collated Evaluation: newsletter → quality score (GPT-4o-mini)

Quality Scores → Annotations (Linked to Traces)
├── Individual Summary: coherence, accuracy, completeness, readability
└── Collated Newsletter: overall quality metrics
```

### Tracing Characteristics
- **Coverage**: 100% of tool and LLM operations
- **Overhead**: < 50ms per operation (async tracing)
- **Cost**: Free tier (< 5K traces/month)
- **Granularity**: Inputs, outputs, duration, success/failure, metadata
- **Annotations**: Quality scores (0-1 scale) with pass/fail threshold (0.5)

## 🗂️ State Management Pattern

### Problem Statement
LangChain tools are stateless by design. When the LLM needs to pass data between tools, it must serialize the data as JSON in function arguments. With 100 search results, this creates a ~14KB payload that exceeds token limits, causing JSON truncation and parsing errors.

### Solution: Session-Based State Cache

**Architecture:**
```typescript
ToolStateManager (Singleton)
├── Session Map: { sessionId → ToolState }
│   ├── "session_123": {
│   │     searchResults: [100 articles],
│   │     extractedArticles: [...],
│   │     summaries: [...]
│   │   }
│   └── "session_456": { ... }
└── Lifecycle: 
    ├── Created: Agent start (setToolSessionId)
    ├── Used: Tools read/write during execution
    └── Destroyed: Agent completion (clearState)
```

**Data Flow:**
```
1. searchWeb(query, maxResults: 100)
   ├── Fetches 100 results via pagination
   ├── Stores in state: toolStateManager.updateState(sessionId, { searchResults })
   └── Returns: { count: 100, message: "Found 100 articles" } ← Small payload

2. LLM sees: "Found 100 articles in state"
   └── Calls: extractScoreAndStoreArticles(relevancyThreshold: 0.8) ← Tiny payload

3. extractScoreAndStoreArticles()
   ├── Reads: state.searchResults (100 articles)
   ├── Processes all 100 articles
   └── Stores results back in state
```

**Benefits:**
- ✅ Eliminates JSON truncation errors
- ✅ Reduces token usage (LLM doesn't re-serialize large arrays)
- ✅ Faster execution (no JSON parsing overhead)
- ✅ Session isolation (parallel runs don't interfere)
- ✅ Automatic cleanup (no memory leaks)

**Trade-offs:**
- ⚠️ In-memory only (lost on server restart)
- ⚠️ Not shared across Vercel instances (OK for single-instance deployments)
- ⚠️ Additional complexity (state management layer)

### Google Custom Search API Pagination

**Constraints:**
- Maximum 10 results per request
- Maximum 100 results total (API hard limit)

**Implementation:**
```typescript
// User sets: maxResults = 100
// System makes 10 paginated requests:
for (let i = 0; i < 10; i++) {
  fetch(`...&num=10&start=${i * 10 + 1}`)
  // Request 1: results 1-10
  // Request 2: results 11-20
  // ...
  // Request 10: results 91-100
}
```

**Validation Layers:**
1. **UI**: `<input max="100" />` + JavaScript validation
2. **Backend**: `Math.min(dbValue, 100)` when reading from Supabase
3. **API**: SearchTools caps pagination at 100

This architecture provides a robust, intelligent, and fully observable solution for automated bio summary generation using LLM-driven tool calling with comprehensive quality tracking and efficient state management.
