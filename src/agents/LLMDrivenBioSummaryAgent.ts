import OpenAI from 'openai';
import { AgentContext, ToolResult, Article, ArticleSummary, EmailRecipient } from '@/types/agent';
import { SearchTools } from '@/tools/SearchTools';
import { ProcessingTools } from '@/tools/ProcessingTools';
import { SummaryTools } from '@/tools/SummaryTools';
import { EmailTools } from '@/tools/EmailTools';
import { getAllToolDefinitions, ToolCall, ToolFunctionName } from '@/tools/ToolDefinitions';
import { langchainIntegration } from '@/lib/langchain';

export class LLMDrivenBioSummaryAgent {
  private openai: OpenAI;
  private context: AgentContext;
  private searchTools: SearchTools;
  private processingTools: ProcessingTools;
  private summaryTools: SummaryTools;
  private emailTools: EmailTools;
  private maxIterations: number = 10;
  private currentIteration: number = 0;

  constructor(initialContext: Partial<AgentContext>) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // Allow browser usage for testing
    });

    this.context = {
      sessionId: this.generateSessionId(),
      startTime: new Date(),
      currentStep: 'initialization',
      foundArticles: [],
      filteredArticles: [],
      storedArticles: [],
      summaries: [],
      finalSummary: '',
      errors: [],
      retryCount: 0,
      lastSuccessfulStep: '',
      ...initialContext
    } as AgentContext;

    this.searchTools = new SearchTools();
    this.processingTools = new ProcessingTools();
    this.summaryTools = new SummaryTools({
      modelName: this.context.systemSettings.llmModel,
      temperature: this.context.systemSettings.llmTemperature,
      maxTokens: this.context.systemSettings.llmMaxTokens
    });
    this.emailTools = new EmailTools();
  }

  /**
   * Main execution method using LLM-driven tool calling
   */
  async execute(): Promise<ToolResult> {
    try {
      console.log(`Starting LLM-driven BioSummaryAgent execution - Session: ${this.context.sessionId}`);
      
      // Create initial trace
      await langchainIntegration.createTrace({
        name: 'llm_driven_bio_summary',
        inputs: this.context,
        metadata: { sessionId: this.context.sessionId, agentType: 'llm_driven' },
        tags: ['agent_execution', 'llm_driven']
      });

      const result = await this.executeWithLLM();
      
      console.log(`LLM-driven BioSummaryAgent execution completed - Session: ${this.context.sessionId}`);
      
      return result;
      
    } catch (error) {
      console.error(`LLM-driven BioSummaryAgent execution failed - Session: ${this.context.sessionId}`, error);
      this.context.errors.push(error as Error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Execute the agent using LLM-driven tool calling
   */
  private async executeWithLLM(): Promise<ToolResult> {
    // Set up timeout to prevent infinite execution
    const startTime = Date.now();
    const maxExecutionTime = 50 * 1000; // 50 seconds (leave 10 seconds buffer for Vercel's 60s limit)
    
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: this.getSystemPrompt()
      },
      {
        role: 'user',
        content: `Generate a daily synthetic biology summary. Here's the context:
        
        Search Settings: ${JSON.stringify(this.context.searchSettings)}
        System Settings: ${JSON.stringify(this.context.systemSettings)}
        Recipients: ${JSON.stringify(this.context.recipients)}
        
        You have access to the following tools:
        - searchWeb: Search for articles using Google Custom Search
        - extractArticles: Extract full content from search result URLs
        - scoreRelevancy: Score articles for relevancy to synthetic biology (MAX 2 articles per call)
        - storeArticles: Store relevant articles in database (max 10)
        - summarizeArticle: Generate individual article summaries (100+ words each)
        - collateSummary: Combine summaries into HTML email format
        - sendEmail: Send final summary via email to recipients
        
        CRITICAL JSON LIMITS:
        - scoreRelevancy: Process maximum 2 articles per call to prevent JSON parsing errors
        - All tool arguments must be under 3000 characters total
        - Article content should be truncated to 1000 characters maximum
        - If you have more than 2 articles, call scoreRelevancy multiple times with batches of 2
        
        Please use these tools in the appropriate sequence to complete the task.`
      }
    ];

    this.currentIteration = 0;

    while (this.currentIteration < this.maxIterations) {
      this.currentIteration++;
      console.log(`LLM iteration ${this.currentIteration}/${this.maxIterations}`);

      // Check for timeout
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > maxExecutionTime) {
        console.warn(`Execution timeout reached (${elapsedTime}ms), stopping execution`);
        break;
      }

      try {
        const response = await this.openai.chat.completions.create({
          model: this.context.systemSettings.llmModel,
          messages,
          tools: getAllToolDefinitions().map(tool => ({
            type: 'function' as const,
            function: tool
          })),
          tool_choice: 'auto',
          temperature: this.context.systemSettings.llmTemperature,
          max_tokens: this.context.systemSettings.llmMaxTokens
        });

        const message = response.choices[0]?.message;
        if (!message) {
          throw new Error('No response from LLM');
        }

        // Add LLM response to messages
        messages.push(message);

        // Check if LLM wants to call tools
        if (message.tool_calls && message.tool_calls.length > 0) {
          console.log(`LLM requested ${message.tool_calls.length} tool calls`);
          
          const toolResults = await this.executeToolCalls(message.tool_calls);
          
          // Add tool results to messages
          toolResults.forEach((result, index) => {
            messages.push({
              role: 'tool',
              tool_call_id: message.tool_calls![index].id,
              content: JSON.stringify(result)
            });
          });

          // Check if we should continue or if task is complete
          if (this.isTaskComplete()) {
            break;
          }
        } else {
          // No tool calls, check if LLM thinks task is complete
          if (this.isTaskComplete()) {
            break;
          }
          
          // Ask LLM to continue with tools
          messages.push({
            role: 'user',
            content: 'Please continue using the available tools to complete the task.'
          });
        }

      } catch (error) {
        console.error(`Error in LLM iteration ${this.currentIteration}:`, error);
        this.context.errors.push(error as Error);
        
        // Try to recover or break if too many errors
        if (this.context.errors.length > 3) {
          throw new Error(`Too many errors in LLM execution: ${error}`);
        }
      }
    }

    if (this.currentIteration >= this.maxIterations) {
      console.warn('Reached maximum iterations without completion');
    }

    return this.generateFinalResult();
  }

  /**
   * Execute tool calls requested by the LLM
   */
  private async executeToolCalls(toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]): Promise<any[]> {
    const results = [];

    for (const toolCall of toolCalls) {
      try {
        console.log(`Executing tool: ${toolCall.function.name}`);
        
        // Add robust JSON parsing with error handling
        let args;
        try {
          args = JSON.parse(toolCall.function.arguments);
        } catch (jsonError) {
          console.error(`JSON parsing failed for tool ${toolCall.function.name}:`, jsonError);
          console.error(`Raw arguments length:`, toolCall.function.arguments.length);
          console.error(`Raw arguments preview:`, toolCall.function.arguments.substring(0, 500) + '...');
          
          // For scoreRelevancy tool, handle the specific case of oversized article content
          if (toolCall.function.name === 'scoreRelevancy') {
            console.log('Handling scoreRelevancy tool with oversized arguments');
            
            // Try to extract articles from the malformed JSON and limit them
            try {
              const rawArgs = toolCall.function.arguments;
              const articlesMatch = rawArgs.match(/"articles":\s*\[(.*?)\]/s);
              
              if (articlesMatch) {
                // Limit to first 2 articles to prevent oversized JSON
                const limitedArgs = rawArgs.replace(
                  /"articles":\s*\[.*?\]/s,
                  `"articles":[${articlesMatch[1].split('},{').slice(0, 2).join('},{')}]`
                );
                
                console.log('Attempting to parse limited arguments');
                args = JSON.parse(limitedArgs);
                
                // Further truncate article content if still too long
                if (args.articles && Array.isArray(args.articles)) {
                  args.articles = args.articles.map((article: any) => ({
                    ...article,
                    content: article.content ? article.content.substring(0, 1000) + '...' : article.content
                  }));
                }
              } else {
                throw new Error('Could not extract articles from malformed JSON');
              }
            } catch (fallbackError) {
              console.error('Fallback parsing failed:', fallbackError);
              throw new Error(`Invalid JSON in tool arguments: ${jsonError instanceof Error ? jsonError.message : 'Unknown JSON parsing error'}`);
            }
          } else {
            // For other tools, try the original truncation logic
            let fixedArgs = toolCall.function.arguments;
            
            if (fixedArgs.length > 10000) {
              console.warn(`Arguments too long (${fixedArgs.length} chars), truncating to 10000 chars`);
              fixedArgs = fixedArgs.substring(0, 10000);
              
              const lastBrace = fixedArgs.lastIndexOf('}');
              const lastBracket = fixedArgs.lastIndexOf(']');
              const truncateAt = Math.max(lastBrace, lastBracket);
              
              if (truncateAt > 5000) {
                fixedArgs = fixedArgs.substring(0, truncateAt + 1);
              }
            }
            
            try {
              args = JSON.parse(fixedArgs);
            } catch (retryError) {
              console.error(`Retry JSON parsing also failed:`, retryError);
              throw new Error(`Invalid JSON in tool arguments: ${jsonError instanceof Error ? jsonError.message : 'Unknown JSON parsing error'}`);
            }
          }
        }
        
        const result = await this.executeTool(toolCall.function.name as ToolFunctionName, args);
        
        results.push({
          success: true,
          data: result,
          toolName: toolCall.function.name
        });

        // Update context based on tool execution
        this.updateContextFromToolResult(toolCall.function.name, result);

      } catch (error) {
        console.error(`Tool execution failed for ${toolCall.function.name}:`, error);
        
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Tool execution failed',
          toolName: toolCall.function.name
        });
      }
    }

    return results;
  }

  /**
   * Execute individual tool
   */
  private async executeTool(toolName: ToolFunctionName, args: any): Promise<any> {
    switch (toolName) {
      case 'searchWeb':
        const searchResult = await this.searchTools.searchWeb(args);
        if (!searchResult.success) {
          throw new Error(`Search failed: ${searchResult.error}`);
        }
        return searchResult.data;

      case 'extractArticles':
        const extractResult = await this.searchTools.extractArticles(args.searchResults);
        if (!extractResult.success) {
          throw new Error(`Article extraction failed: ${extractResult.error}`);
        }
        return extractResult.data;

      case 'scoreRelevancy':
        const scoreResult = await this.processingTools.scoreRelevancy(args.articles);
        if (!scoreResult.success) {
          throw new Error(`Scoring failed: ${scoreResult.error}`);
        }
        return scoreResult.data;

      case 'storeArticles':
        const storeResult = await this.processingTools.storeArticles(args.articles);
        if (!storeResult.success) {
          throw new Error(`Storage failed: ${storeResult.error}`);
        }
        return storeResult.data;

      case 'summarizeArticle':
        const summarizeResult = await this.summaryTools.summarizeArticle(args.articles);
        if (!summarizeResult.success) {
          throw new Error(`Summarization failed: ${summarizeResult.error}`);
        }
        return summarizeResult.data;

      case 'collateSummary':
        const collateResult = await this.summaryTools.collateSummary(args.summaries);
        if (!collateResult.success) {
          throw new Error(`Collation failed: ${collateResult.error}`);
        }
        return collateResult.data;

      case 'sendEmail':
        const emailResult = await this.emailTools.sendEmail(args);
        if (!emailResult.success) {
          throw new Error(`Email sending failed: ${emailResult.error}`);
        }
        return emailResult.data;

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  /**
   * Update context based on tool execution results
   */
  private updateContextFromToolResult(toolName: string, result: any): void {
    switch (toolName) {
      case 'searchWeb':
        // Search results are handled by extractArticles
        this.context.lastSuccessfulStep = 'search';
        break;
        
      case 'extractArticles':
        this.context.foundArticles = result;
        this.context.lastSuccessfulStep = 'search';
        break;
      
      case 'scoreRelevancy':
        this.context.filteredArticles = result;
        this.context.lastSuccessfulStep = 'processing';
        break;
      
      case 'storeArticles':
        this.context.storedArticles = result;
        this.context.lastSuccessfulStep = 'processing';
        break;
      
      case 'summarizeArticle':
        this.context.summaries = result;
        this.context.lastSuccessfulStep = 'summarization';
        break;
      
      case 'collateSummary':
        this.context.finalSummary = result;
        this.context.lastSuccessfulStep = 'summarization';
        break;
      
      case 'sendEmail':
        this.context.lastSuccessfulStep = 'email';
        break;
    }
  }

  /**
   * Check if the task is complete
   */
  private isTaskComplete(): boolean {
    return this.context.finalSummary.length > 0 && 
           this.context.lastSuccessfulStep === 'email';
  }

  /**
   * Generate final result
   */
  private generateFinalResult(): ToolResult {
    const success = this.isTaskComplete();
    
    return {
      success,
      data: {
        sessionId: this.context.sessionId,
        articlesProcessed: this.context.storedArticles.length,
        summariesGenerated: this.context.summaries.length,
        finalSummary: this.context.finalSummary,
        iterationsUsed: this.currentIteration,
        lastSuccessfulStep: this.context.lastSuccessfulStep
      },
      error: success ? undefined : 'Task not completed successfully'
    };
  }

  /**
   * Get system prompt for the LLM
   */
  private getSystemPrompt(): string {
    return `You are an expert AI agent for generating daily synthetic biology summaries. Your task is to:

1. Search for recent synthetic biology articles using web search
2. Extract and analyze article content
3. Score articles for relevancy to synthetic biology
4. Store the most relevant articles (maximum 10)
5. Generate comprehensive summaries (minimum 100 words each)
6. Collate summaries into a cohesive HTML email newsletter
7. Send the final summary to specified email recipients

You must use the available tools in the appropriate sequence. Be thorough and ensure high quality throughout the process.

Key requirements:
- Focus on synthetic biology, biotechnology, and related fields
- Ensure summaries are appropriate for college sophomore level
- Generate HTML-formatted email content
- Include article links and citations
- Maintain professional tone and accuracy

Use the tools systematically and provide clear reasoning for your actions.`;
  }

  /**
   * Get current context
   */
  getContext(): AgentContext {
    return { ...this.context };
  }

  /**
   * Update context
   */
  updateContext(updates: Partial<AgentContext>): void {
    this.context = { ...this.context, ...updates };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `llm_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
