/**
 * LangChain-Based Bio Summary Agent
 * Week 3: Agent Migration - Uses LangChain AgentExecutor for automatic tool orchestration
 */

import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { allLangChainTools, setToolSessionId } from '@/tools/LangChainTools';
import { AgentContext, ToolResult } from '@/types/agent';
import { langchainIntegration } from '@/lib/langchain';
import { toolStateManager, ToolState } from '@/tools/ToolState';
import { randomUUID } from 'crypto';

export class LangChainBioSummaryAgent {
  private context: AgentContext;
  private executor: AgentExecutor | null = null;
  private llm: ChatOpenAI;
  private parentRunId: string | null = null;

  constructor(initialContext: Partial<AgentContext>) {
    // Respect LANGCHAIN_VERBOSE from environment, default to false
    if (process.env.LANGCHAIN_VERBOSE !== 'true') {
      process.env.LANGCHAIN_VERBOSE = 'false';
    }
    if (process.env.LANGCHAIN_DEBUG !== 'true') {
      process.env.LANGCHAIN_DEBUG = 'false';
    }
    // LANGCHAIN_TRACING_V2 controlled via Vercel environment variables
    
    // Initialize context
    // Ensure threadId is always a valid UUID format
    const threadId = initialContext.threadId || randomUUID();
    
    this.context = {
      userId: initialContext.userId || 'unknown', // Ensure userId is set
      searchSettings: initialContext.searchSettings!,
      systemSettings: initialContext.systemSettings!,
      recipients: initialContext.recipients!,
      sessionId: `langchain_session_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      threadId: threadId, // Always use valid UUID format
      startTime: new Date(),
      currentStep: 'initialization',
      foundArticles: [],
      filteredArticles: [],
      storedArticles: [],
      summaries: [],
      finalSummary: '',
      errors: [],
      retryCount: 0,
      lastSuccessfulStep: ''
    };

    // Initialize LangChain ChatOpenAI model
    // Note: Using 4000 maxTokens to allow for large tool call arguments (e.g., passing multiple search results)
    // GPT-5 for superior instruction following and context adherence
    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-5',  // GPT-5 for superior instruction following and context adherence
      temperature: 1,  // GPT-5 only supports default temperature of 1
      maxTokens: 4000, // Tool calls need more tokens
      streaming: false
    });

  }

  /**
   * Initialize the agent executor
   */
  private async initializeAgent(): Promise<void> {
    // Get system prompt (from Hub or fallback)
    const systemPromptTemplate = await this.getSystemPromptTemplate();
    
    // Create OpenAI Tools Agent (newer, more reliable than Functions Agent)
    const agent = await createOpenAIToolsAgent({
      llm: this.llm,
      tools: allLangChainTools,
      prompt: systemPromptTemplate
    });

    // Create AgentExecutor
    this.executor = new AgentExecutor({
      agent,
      tools: allLangChainTools,
      maxIterations: 10,
      returnIntermediateSteps: true,
      handleParsingErrors: true,
      verbose: false  // Reduce logging noise
    });

    console.log(`✅ LangChain AgentExecutor initialized with ${allLangChainTools.length} tools`);
  }

  /**
   * Execute the agent
   */
  async execute(): Promise<ToolResult> {
    try {
      console.log(`Starting LangChain agent execution - Session: ${this.context.sessionId}`);
      
      // Set session ID and user ID for tools to access shared state
      setToolSessionId(this.context.sessionId, this.context.userId);
      
      // Store context in toolState so tools can access recipients and threadId
      toolStateManager.updateState(this.context.sessionId, this.context.userId, {
        context: {
          recipients: this.context.recipients,
          searchSettings: this.context.searchSettings,
          systemSettings: this.context.systemSettings,
          threadId: this.context.threadId
        }
      });
      console.log('[AGENT] Stored context in toolState for session:', this.context.sessionId);
      console.log('[AGENT] Context recipients:', JSON.stringify(this.context.recipients, null, 2));
      
      // Create parent trace for hierarchical tracking
      this.parentRunId = await langchainIntegration.createTrace({
        name: 'langchain_bio_summary_agent',
        inputs: this.context,
        metadata: { 
          sessionId: this.context.sessionId,
          agentType: 'langchain',
          model: this.context.systemSettings.llmModel
        },
        tags: ['agent_execution', 'langchain', 'bio_summary']
      });

      // Store parentRunId in tool state for tools to access
      if (this.parentRunId) {
        toolStateManager.updateState(this.context.sessionId, this.context.userId, {
          context: {
            ...toolStateManager.getState(this.context.sessionId, this.context.userId)?.context,
            parentRunId: this.parentRunId
          }
        });
      }

      // Initialize agent (async operation)
      await this.initializeAgent();

      if (!this.executor) {
        throw new Error('Failed to initialize AgentExecutor');
      }

      // Execute agent with LangChain (pass context data to the LLM)
      console.log('🤖 Invoking LangChain AgentExecutor with GPT-5...');
      console.log('Agent config:', {
        threadId: this.context.threadId,
        maxIterations: this.executor.maxIterations,
        tools: allLangChainTools.map(t => t.name),
        model: 'gpt-5'
      });
      
      // Add GPT-5 output monitoring
      console.log('[GPT-5] Starting execution with enhanced monitoring for output issues');
      
      // Pass context data to the LLM so it has access to recipients, search settings, etc.
      const contextInput = `Generate a daily synthetic biology summary. Here's the context:

Search Settings: ${JSON.stringify(this.context.searchSettings)}
System Settings: ${JSON.stringify(this.context.systemSettings)}
Recipients: ${JSON.stringify(this.context.recipients)}

CRITICAL: You MUST use the EXACT recipients provided above. Do NOT generate or use any other recipients. The recipients in the context are the ONLY recipients you should use.

Use the available tools in the proper sequence to complete the task.`;

      console.log('🔍 [LANGCHAIN-AGENT] Context being passed to LLM:');
      console.log('🔍 [LANGCHAIN-AGENT] Recipients in context:', JSON.stringify(this.context.recipients, null, 2));
      
      const result = await this.executor.invoke(
        { input: contextInput },
        {
          configurable: {
            thread_id: this.context.threadId,
            run_name: `Daily Summary ${new Date().toISOString().split('T')[0]}`
          },
          runId: this.parentRunId ?? undefined,
          tags: [
            'daily-summary',
            `thread:${this.context.threadId}`,
            `model:${this.context.systemSettings.llmModel}`,
            `date:${new Date().toISOString().split('T')[0]}`
          ],
          metadata: {
            threadId: this.context.threadId,
            sessionId: this.context.sessionId,
            runDate: new Date().toISOString().split('T')[0],
            relevancyThreshold: this.context.systemSettings.relevancyThreshold
          },
          callbacks: [
            {
              handleToolError: (error) => {
                console.error(`Tool error:`, error);
              }
            }
          ]
        }
      );

      // Enhanced GPT-5 output validation
      console.log('[GPT-5] Agent execution completed, validating output...');
      console.log('[GPT-5] Result type:', typeof result);
      console.log('[GPT-5] Result keys:', Object.keys(result || {}));
      
      if (!result || (typeof result === 'object' && Object.keys(result).length === 0)) {
        console.error('[GPT-5] Empty or null result detected - GPT-5 may have output issues');
        throw new Error('GPT-5 returned empty result - potential output issue');
      }
      
      if (result.output && typeof result.output === 'string' && result.output.trim().length === 0) {
        console.error('[GPT-5] Empty output string detected');
        throw new Error('GPT-5 returned empty output string');
      }
      
      console.log('[GPT-5] Output validation passed:', {
        hasOutput: !!result.output,
        outputLength: result.output?.length || 0,
        hasIntermediateSteps: !!(result.intermediateSteps && result.intermediateSteps.length > 0)
      });

        // Check if tools were called
        if (!result.intermediateSteps || result.intermediateSteps.length === 0) {
          console.warn('No tools were executed - agent may have stopped prematurely');
        }

        // Update parent trace with outputs
        if (this.parentRunId) {
          await langchainIntegration.updateTrace(this.parentRunId, {
            success: true,
            output: result.output,
            steps: result.intermediateSteps?.length || 0
          });
        }

        const finalToolState = this.getToolStateSnapshot();
        const processedResult = this.processAgentResult(result, finalToolState);

        toolStateManager.clearState(this.context.sessionId, this.context.userId);

        return processedResult;

      } catch (error) {
        console.error('Agent execution failed:', error);
        
        // Update parent trace with error
        if (this.parentRunId) {
          await langchainIntegration.updateTrace(this.parentRunId, {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          });
        }

        toolStateManager.clearState(this.context.sessionId, this.context.userId);

        this.context.errors.push(error as Error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Agent execution failed',
          metadata: {
            sessionId: this.context.sessionId,
            executionTime: Date.now() - this.context.startTime.getTime(),
            errors: this.context.errors.length,
            cost: 0,
            tokens: 0
          }
        };
      }
  }


  /**
   * Get system prompt template from LangSmith Hub
   */
  private async getSystemPromptTemplate(): Promise<ChatPromptTemplate> {
    // Load orchestration prompt from Hub - no fallback
    const orchestrationPrompt = await langchainIntegration.getPrompt('orchestration');
    
    if (!orchestrationPrompt) {
      throw new Error('Failed to load orchestration prompt from LangSmith Hub. Check your Hub configuration and environment variables.');
    }
    
    console.log('✅ Using orchestration prompt from Hub');
    // The Hub prompt should already be a ChatPromptTemplate with proper structure
    // If it's a simple PromptTemplate, we need to convert it
    return ChatPromptTemplate.fromMessages([
      ['system', orchestrationPrompt.template],
      new MessagesPlaceholder({ variableName: 'agent_scratchpad' })
    ]);
  }

  private getToolStateSnapshot(): ToolState | null {
    const sessionId = this.context.sessionId;
    const userId = this.context.userId;

    if (!sessionId || !userId) {
      return null;
    }

    const userSessions = toolStateManager.getUserSessions(userId);
    if (!userSessions.includes(sessionId)) {
      return null;
    }

    const state = toolStateManager.getState(sessionId, userId);

    return {
      ...state,
      searchResults: state.searchResults ? [...state.searchResults] : undefined,
      extractedArticles: state.extractedArticles ? [...state.extractedArticles] : undefined,
      scoredArticles: state.scoredArticles ? [...state.scoredArticles] : undefined,
      storedArticles: state.storedArticles ? [...state.storedArticles] : undefined,
      summaries: state.summaries ? [...state.summaries] : undefined,
      metadata: state.metadata ? { ...state.metadata } : undefined,
      context: state.context ? { ...state.context } : undefined
    };
  }

  private computeMetricsFromState(state: ToolState | null) {
    const lengthOf = (value: unknown): number => (Array.isArray(value) ? value.length : 0);

    if (!state) {
      return {
        articlesFound: 0,
        articlesProcessed: 0,
        summariesGenerated: 0,
        emailSent: false
      };
    }

    const searchResultsCount = lengthOf(state.searchResults);
    const extractedCount = lengthOf(state.extractedArticles);
    const storedCount = lengthOf(state.storedArticles);
    const summariesCount = lengthOf(state.summaries);
    const metadataCountRaw = state.metadata?.totalResults;
    const metadataCount = Number.isFinite(Number(metadataCountRaw)) ? Number(metadataCountRaw) : 0;

    const articlesFound = Math.max(searchResultsCount, extractedCount, storedCount, metadataCount);
    const articlesProcessed = storedCount > 0 ? storedCount : Math.max(extractedCount, summariesCount);
    const summariesGenerated = summariesCount;

    const recipientsCount = Array.isArray(state.context?.recipients) ? state.context?.recipients.length : 0;
    const emailSent =
      summariesGenerated > 0 &&
      recipientsCount > 0 &&
      (typeof state.collatedSummary === 'string'
        ? state.collatedSummary.trim().length > 0
        : Boolean(state.collatedSummary));

    return {
      articlesFound,
      articlesProcessed,
      summariesGenerated,
      emailSent
    };
  }

  /**
   * Process agent result
   */
  private processAgentResult(result: any, finalState: ToolState | null): ToolResult {
    const success = result.output && !result.output.includes('failed');
    const executionTime = Date.now() - this.context.startTime.getTime();
    const metrics = this.computeMetricsFromState(finalState);

    if (finalState) {
      if (finalState.searchResults) {
        this.context.foundArticles = finalState.searchResults as any;
      }
      if (finalState.scoredArticles) {
        this.context.filteredArticles = finalState.scoredArticles as any;
      }
      if (finalState.storedArticles) {
        this.context.storedArticles = finalState.storedArticles as any;
      }
      if (finalState.summaries) {
        this.context.summaries = finalState.summaries as any;
      }
      if (typeof finalState.collatedSummary === 'string') {
        this.context.finalSummary = finalState.collatedSummary;
      }
    }

    return {
      success,
      data: {
        output: result.output,
        intermediateSteps: result.intermediateSteps?.length || 0,
        sessionId: this.context.sessionId,
        articlesFound: metrics.articlesFound,
        articlesProcessed: metrics.articlesProcessed,
        summariesGenerated: metrics.summariesGenerated,
        emailSent: metrics.emailSent
      },
      metadata: {
        sessionId: this.context.sessionId,
        executionTime,
        model: this.context.systemSettings.llmModel,
        steps: result.intermediateSteps?.length || 0,
        agentType: 'langchain',
        articlesFound: metrics.articlesFound,
        articlesProcessed: metrics.articlesProcessed,
        summariesGenerated: metrics.summariesGenerated,
        emailSent: metrics.emailSent,
        parentRunId: this.parentRunId || undefined,
        cost: 0,
        tokens: 0
      },
      error: success ? undefined : 'Task not completed successfully'
    };
  }

  /**
   * Get current context
   */
  getContext(): AgentContext {
    return { ...this.context };
  }
}

