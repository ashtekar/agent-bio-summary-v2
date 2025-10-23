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
import { toolStateManager } from '@/tools/ToolState';

export class LangChainBioSummaryAgent {
  private context: AgentContext;
  private executor: AgentExecutor | null = null;
  private llm: ChatOpenAI;
  private parentRunId: string | null = null;

  constructor(initialContext: Partial<AgentContext>) {
    // Force disable LangChain console logging
    process.env.LANGCHAIN_VERBOSE = 'false';
    process.env.LANGCHAIN_DEBUG = 'false';
    // LANGCHAIN_TRACING_V2 controlled via Vercel environment variables
    
    // Initialize context
    this.context = {
      searchSettings: initialContext.searchSettings!,
      systemSettings: initialContext.systemSettings!,
      recipients: initialContext.recipients!,
      sessionId: `langchain_session_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      threadId: initialContext.threadId || `thread_${Date.now()}`, // Use provided threadId or generate
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
      temperature: 0.1,  // Lower temperature for more deterministic behavior
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
      
      // Set session ID for tools to access shared state
      setToolSessionId(this.context.sessionId);
      
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

      // Initialize agent (async operation)
      await this.initializeAgent();

      if (!this.executor) {
        throw new Error('Failed to initialize AgentExecutor');
      }

      // Execute agent with LangChain (pass context data to the LLM)
      console.log('🤖 Invoking LangChain AgentExecutor...');
      console.log('Agent config:', {
        threadId: this.context.threadId,
        maxIterations: this.executor.maxIterations,
        tools: allLangChainTools.map(t => t.name)
      });
      
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

      // Clean up tool state
      toolStateManager.clearState(this.context.sessionId);

      // Process and return result
      return this.processAgentResult(result);

    } catch (error) {
      console.error('Agent execution failed:', error);
      
      // Update parent trace with error
      if (this.parentRunId) {
        await langchainIntegration.updateTrace(this.parentRunId, {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }

      // Clean up tool state even on error
      toolStateManager.clearState(this.context.sessionId);

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

  /**
   * Process agent result
   */
  private processAgentResult(result: any): ToolResult {
    const success = result.output && !result.output.includes('failed');
    const executionTime = Date.now() - this.context.startTime.getTime();

    return {
      success,
      data: {
        output: result.output,
        intermediateSteps: result.intermediateSteps?.length || 0,
        sessionId: this.context.sessionId
      },
      metadata: {
        sessionId: this.context.sessionId,
        executionTime,
        model: this.context.systemSettings.llmModel,
        steps: result.intermediateSteps?.length || 0,
        agentType: 'langchain',
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

