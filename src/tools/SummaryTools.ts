import { Article, ArticleSummary, ToolResult, EvaluationResult } from '@/types/agent';
import { langchainIntegration } from '@/lib/langchain';
import { summaryStorageService } from '@/services/SummaryStorageService';
import { toolStateManager } from './ToolState';

export class SummaryTools {
  private summarizationLangchain: any;  // For individual articles
  private collationLangchain: any;      // For collation only

  constructor(modelConfig?: {
    modelName?: string;
    temperature?: number;
    maxTokens?: number;
  }) {
    // Instance for individual article summarization (user-selected model)
    this.summarizationLangchain = new (langchainIntegration.constructor as any)({
      modelName: modelConfig?.modelName || 'gpt-4o-mini',
      temperature: modelConfig?.temperature || 0.3,
      maxTokens: modelConfig?.maxTokens || 500,
    });

    // Instance for collation only (fine-tuned gpt-4.1-nano)
    this.collationLangchain = new (langchainIntegration.constructor as any)({
      modelName: 'ft:gpt-4.1-nano-2025-04-14:personal::CFRUvxM1',
      temperature: 0.3, // Fine-tuned models support temperature
      maxTokens: 2000,
    });
  }

  /**
   * Generate individual article summaries
   */
  async summarizeArticle(articles: Article[]): Promise<ToolResult> {
    try {
      console.log(`Generating summaries for ${articles.length} articles`);
      
      // Get threadId from tool state
      const sessionId = this.getSessionId();
      // Get userId from LangChainTools helper (set by agent)
      const { getToolUserId } = require('./LangChainTools');
      const userId = getToolUserId();
      const toolState = toolStateManager.getState(sessionId, userId);
      const threadId = toolState.context?.threadId;
      
      if (!threadId) {
        console.warn('No threadId found in tool state, skipping database storage');
      }
      
      const summaries: ArticleSummary[] = [];
      let totalCost = 0;
      let totalTokens = 0;
      
      // Process articles in parallel with concurrency limit
      const concurrencyLimit = 3;
      const chunks = this.chunkArray(articles, concurrencyLimit);
      
      for (const chunk of chunks) {
        const promises = chunk.map(async (article) => {
          try {
            // Generate summary using Langchain
            const summaryResult = await this.summarizationLangchain.generateSummary({
              title: article.title,
              url: article.url,
              content: article.content.substring(0, 4000) // Limit content length
            });
            
            totalCost += summaryResult.cost;
            totalTokens += summaryResult.tokens;
            
            // Save to database if threadId is available
            if (threadId && summaryResult.runId) {
              try {
                await summaryStorageService.saveArticleSummary(
                  {
                    articleId: article.id,
                    threadId: threadId,
                    summary: summaryResult.summary,
                    modelUsed: this.summarizationLangchain.modelName || 'gpt-4o-mini',
                    langsmithRunId: summaryResult.runId
                  },
                  userId
                );
                console.log(`✅ Saved article summary for article ${article.id} to database`);
              } catch (storageError) {
                console.warn(`⚠️ Failed to save article summary for article ${article.id} to database (article may not exist in articles table):`, storageError);
                // Continue execution even if storage fails
                // Note: This can happen if the article wasn't stored in the articles table first
              }
            }
            
            return {
              articleId: article.id,
              summary: summaryResult.summary,
              keyPoints: this.extractKeyPoints(summaryResult.summary),
              qualityScore: 0, // Will be evaluated by LangSmith UI evaluators
              evaluationResults: {
                coherence: 0,
                accuracy: 0,
                completeness: 0,
                readability: 0,
                overallScore: 0,
                feedback: 'Evaluation will be performed by LangSmith UI evaluators'
              }
            } as ArticleSummary;
            
          } catch (error) {
            console.warn(`Failed to summarize article ${article.id}:`, error);
            return {
              articleId: article.id,
              summary: `Summary generation failed for: ${article.title}`,
              keyPoints: [],
              qualityScore: 0,
              evaluationResults: {
                coherence: 0,
                accuracy: 0,
                completeness: 0,
                readability: 0,
                overallScore: 0,
                feedback: 'Summary generation failed'
              }
            } as ArticleSummary;
          }
        });
        
        const chunkResults = await Promise.all(promises);
        summaries.push(...chunkResults);
      }

      console.log(`Successfully generated ${summaries.length} article summaries`);
      
      return {
        success: true,
        data: summaries,
        metadata: {
          executionTime: Date.now(),
          cost: totalCost,
          tokens: totalTokens
        }
      };

    } catch (error) {
      console.error('Article summarization failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Article summarization failed'
      };
    }
  }

  /**
   * Collate individual summaries into final HTML email format using deterministic template
   */
  async collateSummary(summaries: ArticleSummary[]): Promise<ToolResult> {
    try {
      console.log(`Collating ${summaries.length} summaries using deterministic template`);
      
      // Get threadId and stored articles from tool state
      const sessionId = this.getSessionId();
      // Get userId from LangChainTools helper (set by agent)
      const { getToolUserId } = require('./LangChainTools');
      const userId = getToolUserId();
      const toolState = toolStateManager.getState(sessionId, userId);
      const threadId = toolState.context?.threadId;
      const storedArticles = toolState.storedArticles || [];
      
      if (summaries.length === 0) {
        throw new Error('No summaries available for collation');
      }
      
      // Filter summaries to only include those with articles in storedArticles
      // This ensures the HTML count matches what was actually stored in the database
      const storedArticleIds = new Set(storedArticles.map(a => a.id));
      const validSummaries = summaries.filter(s => storedArticleIds.has(s.articleId));
      
      if (validSummaries.length < summaries.length) {
        console.warn(`⚠️ Filtered out ${summaries.length - validSummaries.length} summaries that don't have corresponding stored articles`);
        console.warn(`⚠️ This usually means articles were filtered by relevancy but still summarized`);
      }
      
      // Build deterministic HTML with filtered summaries
      const collatedHtml = this.buildDeterministicCollation(validSummaries, storedArticles);
      
      // Save to database
      // Note: No LangSmith evaluation needed - collation is deterministic (no LLM, no variability to evaluate)
      if (threadId) {
        try {
          const parentRunId = (toolState?.context as any)?.parentRunId as string | undefined;
          await summaryStorageService.saveDailySummary({
            threadId: threadId,
            collatedSummary: collatedHtml,
            htmlContent: collatedHtml,
            collationModel: 'deterministic-template-v1',
            articlesSummarized: validSummaries.length, // Use filtered count
            langsmithRunId: parentRunId || `deterministic-${threadId}-${Date.now()}`
          });
        } catch (storageError) {
          console.warn(`Failed to save daily summary to database:`, storageError);
          // Continue execution even if storage fails
        }
      }
      
      console.log(`Successfully collated ${validSummaries.length} summaries using deterministic template`);
      
      return {
        success: true,
        data: collatedHtml,
        metadata: {
          executionTime: Date.now(),
          cost: 0, // No LLM cost
          tokens: 0
        }
      };
    } catch (error) {
      console.error('Summary collation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Summary collation failed'
      };
    }
  }


  /**
   * Build deterministic HTML collation from summaries and article metadata
   */
  private buildDeterministicCollation(
    summaries: ArticleSummary[], 
    storedArticles: Article[]
  ): string {
    // Create article map for metadata lookup
    const articleMap = new Map(storedArticles.map(a => [a.id, a]));
    
    // Build intro section
    const intro = `
    <p style="text-align: left; font-weight: normal; margin-bottom: 20px;">Today's newsletter covers ${summaries.length} article${summaries.length !== 1 ? 's' : ''} in synthetic biology and biotechnology.</p>
  `;
    
    // Build article blocks (VERBATIM summaries)
    const articles = summaries.map((summary, idx) => {
      const article = articleMap.get(summary.articleId);
      const title = article?.title || `Article ${idx + 1}`;
      const url = article?.url || '#';
      const source = article?.source || 'Unknown Source';
      const relevancy = article?.relevancyScore || 0;
      
      return `
    <article class="article-block">
      <h2>
        <a href="${this.escapeHtml(url)}">
          ${this.escapeHtml(title)}
        </a>
      </h2>
      <div class="article-meta">
        <span class="source">${this.escapeHtml(source)}</span> • 
        <span class="relevancy">Relevancy: ${Math.round(relevancy * 100)}%</span>
      </div>
      <div class="article-summary">
        ${summary.summary}
      </div>
      <div class="article-link">
        <a href="${this.escapeHtml(url)}" target="_blank">Read full article →</a>
      </div>
    </article>
    `;
    }).join('\n');
    
    return intro + articles;
  }

  /**
   * Escape HTML special characters to prevent XSS
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Extract key points from summary
   */
  private extractKeyPoints(summary: string): string[] {
    // Simple key point extraction - in production, use more sophisticated NLP
    const sentences = summary.split('.').filter(s => s.trim().length > 20);
    return sentences.slice(0, 3).map(s => s.trim() + '.');
  }


  /**
   * Split array into chunks for parallel processing
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Get current session ID for tool state access
   */
  private getSessionId(): string {
    // Import the function from LangChainTools
    const { getToolSessionId } = require('./LangChainTools');
    return getToolSessionId();
  }
}
