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
    // The DB setting (llmMaxTokens) is too low for tool-calling agents
    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: this.context.systemSettings.llmModel,
      temperature: this.context.systemSettings.llmTemperature,
      maxTokens: 4000, // Override DB setting - tool calls need more tokens
      streaming: false
    });

    console.log(`Initialized LangChain agent with model: ${this.context.systemSettings.llmModel}, maxTokens: 4000 (overridden for tool calling)`);
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
      verbose: true
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

      // Build agent input
      const agentInput = this.buildAgentInput();

      // Execute agent with LangChain
      console.log('🤖 Invoking LangChain AgentExecutor...');
      console.log('Agent input:', agentInput);
      console.log('Agent config:', {
        threadId: this.context.threadId,
        maxIterations: this.executor.maxIterations,
        tools: allLangChainTools.map(t => t.name)
      });
      
      const result = await this.executor.invoke(
        { input: agentInput },
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
              handleToolStart: (tool, input) => {
                console.log(`🔧 Tool START: ${tool.name}`, JSON.stringify(input).substring(0, 200));
              },
              handleToolEnd: (output) => {
                console.log(`✅ Tool END:`, typeof output, String(output).substring(0, 200));
              },
              handleToolError: (error) => {
                console.error(`❌ Tool ERROR:`, error);
              }
            }
          ]
        }
      );

      console.log('✅ LangChain agent execution completed');
      console.log('Result output:', result.output);
      console.log('Intermediate steps:', result.intermediateSteps?.length || 0);
      
      // Debug: Check if tools were called
      if (!result.intermediateSteps || result.intermediateSteps.length === 0) {
        console.warn('⚠️  WARNING: No tools were executed! Agent may have stopped prematurely.');
        console.warn('This might indicate a configuration issue with the AgentExecutor.');
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
   * Build agent input from context
   */
  private buildAgentInput(): string {
    const { searchSettings, recipients, systemSettings } = this.context;
    const relevancyThreshold = systemSettings.relevancyThreshold ?? 0.2;
    
    // Format recipients for the LLM
    const recipientsInfo = recipients.map(r => `  - ${r.name} <${r.email}>`).join('\n');
    
    return `Generate a daily synthetic biology summary with the following context:

Search Settings:
- Query: ${searchSettings.query}
- Max Results: ${searchSettings.maxResults}
- Date Range: ${searchSettings.dateRange}
- Sources: ${searchSettings.sources.join(', ')}
- Relevancy Threshold: ${relevancyThreshold} (only articles scoring >= ${relevancyThreshold} should be processed)

Email Recipients (${recipients.length}):
${recipientsInfo}

Task:
1. Search for articles using searchWeb
2. Use extractScoreAndStoreArticles with relevancyThreshold=${relevancyThreshold} - NOTE: searchResults are automatically read from state, just pass the threshold
3. Summarize articles (MAX 2 per call) using summarizeArticle - ONLY summarize articles that passed the relevancy threshold
4. Collate summaries into newsletter using collateSummary
5. Send email to ALL recipients listed above using sendEmail

IMPORTANT: 
- After searchWeb, call extractScoreAndStoreArticles with ONLY relevancyThreshold (searchResults are read from state automatically)
- Include ALL ${recipients.length} recipient(s) in the sendEmail call
- Only summarize articles with relevancyScore >= ${relevancyThreshold}`;
  }

  /**
   * Get system prompt template from LangSmith Hub
   */
  private async getSystemPromptTemplate(): Promise<ChatPromptTemplate> {
    try {
      // Try to load orchestration prompt from Hub
      const orchestrationPrompt = await langchainIntegration.getPrompt('orchestration');
      
      if (orchestrationPrompt) {
        console.log('✅ Using orchestration prompt from Hub');
        // The Hub prompt should already be a ChatPromptTemplate with proper structure
        // If it's a simple PromptTemplate, we need to convert it
        return ChatPromptTemplate.fromMessages([
          ['system', orchestrationPrompt.template],
          ['human', '{input}'],
          new MessagesPlaceholder({ variableName: 'agent_scratchpad' })
        ]);
      }
    } catch (error) {
      console.warn('Failed to load orchestration prompt from Hub, using hardcoded fallback:', error);
    }
    
    // Fallback to hardcoded prompt
    console.log('Using hardcoded orchestration prompt (fallback)');
    return ChatPromptTemplate.fromMessages([
      ['system', `You are an expert AI agent for generating daily synthetic biology summaries.

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
- Maintain professional tone and accuracy`],
      ['human', '{input}'],
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

