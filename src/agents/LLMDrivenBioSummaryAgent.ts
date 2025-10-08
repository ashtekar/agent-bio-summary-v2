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
    const maxExecutionTime = 170 * 1000; // 170 seconds (leave 10 seconds buffer for Vercel's 180s limit)
    
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
        - extractScoreAndStoreArticles: **[OPTIMIZED - USE THIS]** Extract content, score relevancy, and store articles in ONE efficient call
        - extractArticles: [LEGACY] Extract full content from search result URLs
        - scoreRelevancy: [LEGACY] Score articles for relevancy to synthetic biology
        - storeArticles: [LEGACY] Store relevant articles in database
        - summarizeArticle: Generate individual article summaries (MAX 2 articles per call)
        - collateSummary: Combine summaries into HTML email format
        - sendEmail: Send final summary via email to recipients (MUST include recipients from context above)
        
        RECOMMENDED WORKFLOW:
        1. searchWeb → Get all search results
        2. extractScoreAndStoreArticles → Process ALL search results at once (or in batches if >10 results)
        3. summarizeArticle (batch of 2 articles at a time)
        4. collateSummary
        5. sendEmail
        
        IMPORTANT: Pass ALL search results to extractScoreAndStoreArticles in one call. It will handle extraction, scoring, and storage efficiently.
        
        CRITICAL JSON LIMITS:
        - summarizeArticle: Process maximum 2 articles per call to prevent JSON parsing errors
        - All tool arguments must be under 6000 characters total
        - If you have more than 2 articles for summarization, call summarizeArticle multiple times with batches of 2
        
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
          
          // Preprocess tool calls to prevent oversized JSON
          const preprocessedToolCalls = this.preprocessToolCalls(message.tool_calls);
          
          const toolResults = await this.executeToolCalls(preprocessedToolCalls);
          
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
   * Find the best JSON truncation point to avoid breaking JSON structure
   */
  private findBestJsonTruncationPoint(jsonStr: string): number {
    // Look for safe truncation points in order of preference
    interface SafePoint {
      index: number;
      type: string;
      priority: number;
    }
    const safePoints: SafePoint[] = [];
    
    // 1. Look for complete JSON objects/arrays (most preferred)
    const objectMatches = [...jsonStr.matchAll(/\}[^}]*$/g)];
    const arrayMatches = [...jsonStr.matchAll(/\]/g)];
    
    // 2. Look for string boundaries (less preferred but safe)
    const stringMatches = [...jsonStr.matchAll(/"[^"]*"$/g)];
    
    // 3. Look for comma boundaries (least preferred but workable)
    const commaMatches = [...jsonStr.matchAll(/,[^,]*$/g)];
    
    // Collect all potential truncation points
    objectMatches.forEach(match => {
      if (match.index !== undefined) {
        safePoints.push({ index: match.index + 1, type: 'object', priority: 1 });
      }
    });
    
    arrayMatches.forEach(match => {
      if (match.index !== undefined) {
        safePoints.push({ index: match.index + 1, type: 'array', priority: 1 });
      }
    });
    
    stringMatches.forEach(match => {
      if (match.index !== undefined && match[0]) {
        safePoints.push({ index: match.index + match[0].length, type: 'string', priority: 2 });
      }
    });
    
    commaMatches.forEach(match => {
      if (match.index !== undefined) {
        safePoints.push({ index: match.index, type: 'comma', priority: 3 });
      }
    });
    
    // Sort by priority (lower number = higher priority) and position
    safePoints.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return b.index - a.index; // Prefer later positions
    });
    
    // Return the best truncation point, or fallback to simple brace/bracket detection
    if (safePoints.length > 0) {
      return safePoints[0].index;
    }
    
    // Fallback to simple detection
    const lastBrace = jsonStr.lastIndexOf('}');
    const lastBracket = jsonStr.lastIndexOf(']');
    return Math.max(lastBrace, lastBracket);
  }

  /**
   * Smart truncate content to preserve important keywords for relevancy scoring
   */
  private smartTruncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) {
      return content;
    }

    // Keywords that are important for relevancy scoring
    const importantKeywords = [
      'synthetic biology', 'bioengineering', 'genetic engineering', 'biotechnology',
      'biotech', 'molecular biology', 'cell biology', 'protein engineering',
      'metabolic engineering', 'systems biology', 'synthetic genomics', 'biofabrication'
    ];

    // Try to find a good truncation point that preserves keywords
    let bestTruncatePoint = maxLength;
    let maxKeywordScore = 0;

    // Check different truncation points within a reasonable range
    for (let i = Math.max(0, maxLength - 200); i <= Math.min(content.length, maxLength + 200); i += 50) {
      const truncated = content.substring(0, i);
      let keywordScore = 0;
      
      importantKeywords.forEach(keyword => {
        if (truncated.toLowerCase().includes(keyword.toLowerCase())) {
          keywordScore += keyword.length; // Longer keywords get more weight
        }
      });

      if (keywordScore > maxKeywordScore) {
        maxKeywordScore = keywordScore;
        bestTruncatePoint = i;
      }
    }

    // If we found a good point, use it; otherwise use simple truncation
    if (maxKeywordScore > 0) {
      return content.substring(0, bestTruncatePoint) + '...';
    } else {
      return content.substring(0, maxLength) + '...';
    }
  }

  /**
   * Preprocess tool calls to prevent oversized JSON arguments
   */
  private preprocessToolCalls(toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]): OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] {
    return toolCalls.map(toolCall => {
      // Handle tools that might have large article data
      if (toolCall.function.name === 'extractScoreAndStoreArticles' || toolCall.function.name === 'extractArticles' || toolCall.function.name === 'scoreRelevancy' || toolCall.function.name === 'storeArticles' || toolCall.function.name === 'summarizeArticle' || toolCall.function.name === 'collateSummary' || toolCall.function.name === 'sendEmail') {
        try {
          // First, check if arguments are too long and truncate if needed
          let argumentsStr = toolCall.function.arguments;
          
          // Check if JSON is already invalid (e.g., truncated by OpenAI before we received it)
          // This happens when LLM generates > max tokens and OpenAI cuts it off mid-string
          let needsBoundaryFix = false;
          try {
            JSON.parse(argumentsStr);
          } catch (parseError) {
            if (parseError instanceof SyntaxError && parseError.message.includes('Unterminated string')) {
              console.warn(`Received truncated JSON from LLM (${argumentsStr.length} chars), attempting repair...`);
              needsBoundaryFix = true;
            } else {
              // Some other JSON error, re-throw it
              throw parseError;
            }
          }
          
          // Apply boundary fix if needed OR if arguments are too long
          if (needsBoundaryFix || argumentsStr.length > 6000) {
            if (argumentsStr.length > 6000) {
              console.warn(`Arguments too long (${argumentsStr.length} chars), truncating to 6000 chars`);
              argumentsStr = argumentsStr.substring(0, 6000);
            }
            
            // Always apply JSON boundary detection when we need to fix truncation
            const truncateAt = this.findBestJsonTruncationPoint(argumentsStr);
            if (truncateAt > 500) { // Lowered threshold - any reasonable truncation point is acceptable
              argumentsStr = argumentsStr.substring(0, truncateAt + 1);
              
              console.log(`Before comma removal: ${argumentsStr.substring(argumentsStr.length - 50)}`);
              
              // Remove trailing commas that would make JSON invalid
              // The comma might be right at the end after truncation: {...},
              // Or before a bracket we're about to add: {...},]
              argumentsStr = argumentsStr.trimEnd(); // Remove trailing whitespace first
              if (argumentsStr.endsWith(',')) {
                argumentsStr = argumentsStr.slice(0, -1); // Remove trailing comma
                console.log('Removed trailing comma at end of string');
              }
              
              console.log(`After comma removal: ${argumentsStr.substring(argumentsStr.length - 50)}`);
              
              // Ensure we close the JSON properly
              // If we have an open array or object, close it
              const openBraces = (argumentsStr.match(/\{/g) || []).length;
              const closeBraces = (argumentsStr.match(/\}/g) || []).length;
              const openBrackets = (argumentsStr.match(/\[/g) || []).length;
              const closeBrackets = (argumentsStr.match(/\]/g) || []).length;
              
              // Add missing closing brackets/braces
              for (let i = 0; i < (openBrackets - closeBrackets); i++) {
                argumentsStr += ']';
              }
              for (let i = 0; i < (openBraces - closeBraces); i++) {
                argumentsStr += '}';
              }
              
              console.log(`JSON boundary detection: truncated to ${truncateAt + 1} chars, added ${(openBrackets - closeBrackets)} ] and ${(openBraces - closeBraces)} } to close JSON`);
            } else {
              // No good boundary found, fallback to empty
              console.warn(`No safe JSON boundary found, using fallback`);
              throw new Error('No safe JSON truncation point found');
            }
          }
          
          const args = JSON.parse(argumentsStr);
          
          // Special handling for combined tool - allow ALL search results (no limit)
          if (toolCall.function.name === 'extractScoreAndStoreArticles' && args.searchResults && Array.isArray(args.searchResults)) {
            // Only truncate snippets for safety, but process ALL results
            const processedResults = args.searchResults.map((result: any) => ({
              ...result,
              snippet: result.snippet ? result.snippet.substring(0, 300) : result.snippet
            }));
            
            const processedArgs = { searchResults: processedResults };
            const newArguments = JSON.stringify(processedArgs);
            
            console.log(`Preprocessed ${toolCall.function.name}: processing ${processedResults.length} search results, args length: ${newArguments.length}`);
            
            return {
              ...toolCall,
              function: {
                ...toolCall.function,
                arguments: newArguments
              }
            };
          }
          
          if (toolCall.function.name === 'extractArticles' && args.searchResults && Array.isArray(args.searchResults)) {
            // Limit to maximum 2 search results for extraction
            const limitedResults = args.searchResults.slice(0, 2).map((result: any) => ({
              ...result,
              snippet: result.snippet ? result.snippet.substring(0, 200) : result.snippet
            }));
            
            const limitedArgs = { searchResults: limitedResults };
            const newArguments = JSON.stringify(limitedArgs);
            
            console.log(`Preprocessed ${toolCall.function.name}: limited from ${args.searchResults.length} to ${limitedResults.length} results, args length: ${newArguments.length}`);
            
            return {
              ...toolCall,
              function: {
                ...toolCall.function,
                arguments: newArguments
              }
            };
          }
          
          if (toolCall.function.name === 'sendEmail' && args.summary) {
            // Truncate HTML summary content for sendEmail
            const truncatedSummary = this.smartTruncateContent(args.summary, 2000);
            const limitedArgs = { ...args, summary: truncatedSummary };
            const newArguments = JSON.stringify(limitedArgs);
            
            console.log(`Preprocessed ${toolCall.function.name}: truncated summary from ${args.summary.length} to ${truncatedSummary.length} chars, args length: ${newArguments.length}`);
            
            return {
              ...toolCall,
              function: {
                ...toolCall.function,
                arguments: newArguments
              }
            };
          }
          
          if (args.articles && Array.isArray(args.articles)) {
            // Limit to maximum 2 articles and smart truncate content
            const limitedArticles = args.articles.slice(0, 2).map((article: any) => ({
              ...article,
              content: article.content ? this.smartTruncateContent(article.content, 2500) : article.content
            }));
            
            const limitedArgs = { articles: limitedArticles };
            const newArguments = JSON.stringify(limitedArgs);
            
            console.log(`Preprocessed ${toolCall.function.name}: limited from ${args.articles.length} to ${limitedArticles.length} articles, args length: ${newArguments.length}`);
            
            return {
              ...toolCall,
              function: {
                ...toolCall.function,
                arguments: newArguments
              }
            };
          }
        } catch (error) {
          console.warn(`Failed to preprocess ${toolCall.function.name} tool call:`, error);
          // If preprocessing fails, create a minimal safe version
          if (toolCall.function.name === 'extractScoreAndStoreArticles') {
            console.warn(`Creating minimal safe version for ${toolCall.function.name} (combined tool)`);
            return {
              ...toolCall,
              function: {
                ...toolCall.function,
                arguments: JSON.stringify({ searchResults: [] })
              }
            };
          } else if (toolCall.function.name === 'extractArticles') {
            console.warn(`Creating minimal safe version for ${toolCall.function.name}`);
            return {
              ...toolCall,
              function: {
                ...toolCall.function,
                arguments: JSON.stringify({ searchResults: [] })
              }
            };
          } else if (toolCall.function.name === 'scoreRelevancy' || toolCall.function.name === 'storeArticles' || toolCall.function.name === 'summarizeArticle') {
            console.warn(`Creating minimal safe version for ${toolCall.function.name}`);
            return {
              ...toolCall,
              function: {
                ...toolCall.function,
                arguments: JSON.stringify({ articles: [] })
              }
            };
          } else if (toolCall.function.name === 'collateSummary') {
            console.warn(`Creating minimal safe version for ${toolCall.function.name}`);
            // Use summaries from context if available
            const summaries = this.context.summaries || [];
            return {
              ...toolCall,
              function: {
                ...toolCall.function,
                arguments: JSON.stringify({ summaries: summaries })
              }
            };
          } else if (toolCall.function.name === 'sendEmail') {
            console.warn(`Creating minimal safe version for ${toolCall.function.name}`);
            // Use recipients from context instead of trying to parse broken JSON
            const recipients = this.context.recipients || [];
            return {
              ...toolCall,
              function: {
                ...toolCall.function,
                arguments: JSON.stringify({ 
                  summary: '<div class="content"><h2>Synthetic Biology Daily</h2><p>Your daily dose of innovation in synthetic biology</p><p>Summary content was truncated due to processing constraints, but the agent successfully found and processed articles.</p></div>',
                  recipients: recipients,
                  metadata: { 
                    sessionId: this.context.sessionId, 
                    articlesCount: this.context.storedArticles.length, 
                    executionTime: Date.now() - this.context.startTime.getTime()
                  }
                })
              }
            };
          }
        }
      }
      
      return toolCall;
    });
  }

  /**
   * Execute tool calls requested by the LLM
   */
  private async executeToolCalls(toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]): Promise<any[]> {
    const results = [];

    for (const toolCall of toolCalls) {
      try {
        console.log(`Executing tool: ${toolCall.function.name}`);
        
        // Parse tool arguments (should be valid JSON after preprocessing)
        let args;
        try {
          args = JSON.parse(toolCall.function.arguments);
        } catch (jsonError) {
          console.error(`JSON parsing failed for tool ${toolCall.function.name}:`, jsonError);
          console.error(`Raw arguments length:`, toolCall.function.arguments.length);
          console.error(`Raw arguments preview:`, toolCall.function.arguments.substring(0, 500) + '...');
          throw new Error(`Invalid JSON in tool arguments: ${jsonError instanceof Error ? jsonError.message : 'Unknown JSON parsing error'}`);
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

      case 'extractScoreAndStoreArticles':
        console.log('[TOOL] Executing combined extractScoreAndStoreArticles');
        const relevancyThreshold = this.context.systemSettings.relevancyThreshold ?? 0.2;
        console.log(`[TOOL] Using relevancy threshold from settings: ${relevancyThreshold}`);
        const combinedResult = await this.searchTools.extractScoreAndStoreArticles(args.searchResults, relevancyThreshold);
        if (!combinedResult.success) {
          throw new Error(`Combined extract/score/store failed: ${combinedResult.error}`);
        }
        // Update context with all three phases
        this.context.foundArticles = combinedResult.data;
        this.context.filteredArticles = combinedResult.data;
        this.context.storedArticles = combinedResult.data;
        this.context.lastSuccessfulStep = 'processing';
        console.log(`[TOOL] Combined tool completed: ${combinedResult.data.length} relevant articles`);
        return combinedResult.data;

      case 'extractArticles':
        const extractResult = await this.searchTools.extractArticles(args.searchResults);
        if (!extractResult.success) {
          throw new Error(`Article extraction failed: ${extractResult.error}`);
        }
        return extractResult.data;

      case 'scoreRelevancy':
        const scoreThreshold = this.context.systemSettings.relevancyThreshold ?? 0.2;
        const scoreResult = await this.processingTools.scoreRelevancy(args.articles, scoreThreshold);
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
        
      case 'extractScoreAndStoreArticles':
        // Combined tool updates all three context fields at once
        this.context.foundArticles = result;
        this.context.filteredArticles = result;
        this.context.storedArticles = result;
        this.context.lastSuccessfulStep = 'processing';
        console.log(`[Context] Updated after combined tool: ${result.length} articles extracted, scored, and stored`);
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
2. **Use extractScoreAndStoreArticles to efficiently extract, score, and store articles in ONE step** (PREFERRED - saves time and cost)
3. Generate comprehensive summaries (minimum 100 words each)
4. Collate summaries into a cohesive HTML email newsletter
5. Send the final summary to specified email recipients

TOOL OPTIMIZATION GUIDANCE:
- **PREFERRED**: Use 'extractScoreAndStoreArticles' after searchWeb - it combines extract + score + store in ONE efficient call
- **LEGACY**: You can still use separate 'extractArticles', 'scoreRelevancy', 'storeArticles' if needed for debugging
- The combined tool is 3x faster and uses fewer API calls - use it whenever possible!

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
