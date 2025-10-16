import { AgentContext, ToolResult } from '@/types/agent';
import { SearchTools } from '@/tools/SearchTools';
import { ProcessingTools } from '@/tools/ProcessingTools';
import { SummaryTools } from '@/tools/SummaryTools';
import { EmailTools } from '@/tools/EmailTools';

export class BioSummaryAgent {
  private context: AgentContext;
  private searchTools: SearchTools;
  private processingTools: ProcessingTools;
  private summaryTools: SummaryTools;
  private emailTools: EmailTools;

  constructor(initialContext: Partial<AgentContext>) {
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
    this.summaryTools = new SummaryTools();
    this.emailTools = new EmailTools();
  }

  /**
   * Main execution method for the bio summary agent
   */
  async execute(): Promise<ToolResult> {
    try {
      // Step 1: Search for articles
      await this.executeSearch();
      
      // Step 2: Process and filter articles
      await this.executeProcessing();
      
      // Step 3: Generate summaries
      await this.executeSummarization();
      
      // Step 4: Send email
      await this.executeEmail();
      
      return {
        success: true,
        data: {
          sessionId: this.context.sessionId,
          articlesProcessed: this.context.storedArticles.length,
          summariesGenerated: this.context.summaries.length,
          finalSummary: this.context.finalSummary
        }
      };
      
    } catch (error) {
      console.error(`BioSummaryAgent execution failed:`, error);
      this.context.errors.push(error as Error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Execute search phase
   */
  private async executeSearch(): Promise<void> {
    this.context.currentStep = 'search';
    console.log('Executing search phase...');
    
    // Search for articles
    const searchResult = await this.searchTools.searchWeb(this.context.searchSettings);
    if (!searchResult.success) {
      throw new Error(`Search failed: ${searchResult.error}`);
    }
    
    // Extract article content
    const extractResult = await this.searchTools.extractArticles(searchResult.data);
    if (!extractResult.success) {
      throw new Error(`Article extraction failed: ${extractResult.error}`);
    }
    
    this.context.foundArticles = extractResult.data;
    this.context.lastSuccessfulStep = 'search';
    
    console.log(`Found ${this.context.foundArticles.length} articles`);
  }

  /**
   * Execute processing phase
   */
  private async executeProcessing(): Promise<void> {
    this.context.currentStep = 'processing';
    console.log('Executing processing phase...');
    
    // Score articles for relevancy using user keywords
    const userKeywords = this.context.searchSettings.query ? 
      this.context.searchSettings.query.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0) : 
      [];
    console.log(`[SCORING] Using user keywords: ${userKeywords.join(', ')}`);
    const scoreResult = await this.processingTools.scoreRelevancy(this.context.foundArticles, undefined, userKeywords);
    if (!scoreResult.success) {
      throw new Error(`Scoring failed: ${scoreResult.error}`);
    }
    
    this.context.filteredArticles = scoreResult.data;
    
    // Store relevant articles
    const storeResult = await this.processingTools.storeArticles(this.context.filteredArticles);
    if (!storeResult.success) {
      throw new Error(`Storage failed: ${storeResult.error}`);
    }
    
    this.context.storedArticles = storeResult.data;
    this.context.lastSuccessfulStep = 'processing';
    
    console.log(`Processed and stored ${this.context.storedArticles.length} relevant articles`);
  }

  /**
   * Execute summarization phase
   */
  private async executeSummarization(): Promise<void> {
    this.context.currentStep = 'summarization';
    console.log('Executing summarization phase...');
    
    // Generate individual article summaries
    const summarizeResult = await this.summaryTools.summarizeArticle(this.context.storedArticles);
    if (!summarizeResult.success) {
      throw new Error(`Article summarization failed: ${summarizeResult.error}`);
    }
    
    this.context.summaries = summarizeResult.data;
    
    // Collate final summary
    const collateResult = await this.summaryTools.collateSummary(this.context.summaries);
    if (!collateResult.success) {
      throw new Error(`Summary collation failed: ${collateResult.error}`);
    }
    
    this.context.finalSummary = collateResult.data;
    this.context.lastSuccessfulStep = 'summarization';
    
    console.log('Summarization phase completed');
  }

  /**
   * Execute email phase
   */
  private async executeEmail(): Promise<void> {
    this.context.currentStep = 'email';
    console.log('Executing email phase...');
    
    const emailResult = await this.emailTools.sendEmail({
      summary: this.context.finalSummary,
      recipients: this.context.recipients,
      metadata: {
        sessionId: this.context.sessionId,
        articlesCount: this.context.storedArticles.length,
        executionTime: Date.now() - this.context.startTime.getTime()
      }
    });
    
    if (!emailResult.success) {
      throw new Error(`Email sending failed: ${emailResult.error}`);
    }
    
    this.context.lastSuccessfulStep = 'email';
    console.log('Email phase completed');
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
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
