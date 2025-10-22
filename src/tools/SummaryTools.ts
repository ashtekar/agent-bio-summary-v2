import { Article, ArticleSummary, ToolResult, EvaluationResult } from '@/types/agent';
import { langchainIntegration } from '@/lib/langchain';

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
   * Collate individual summaries into final HTML email format
   */
  async collateSummary(summaries: ArticleSummary[]): Promise<ToolResult> {
    try {
      console.log(`Collating ${summaries.length} summaries into final format`);
      
      // Note: Quality evaluation now happens asynchronously in LangSmith UI
      // We collate all summaries since quality scores are not available synchronously
      const qualitySummaries = summaries;
      
      if (qualitySummaries.length === 0) {
        throw new Error('No summaries available for collation');
      }

      // Generate collated summary using Langchain
      const summaryTexts = qualitySummaries.map(s => s.summary);
      const collatedResult = await this.collationLangchain.generateCollatedSummary(summaryTexts);
      
      console.log(`Successfully collated summaries (Quality evaluation will be performed by LangSmith UI evaluators)`);
      
      return {
        success: true,
        data: collatedResult.summary,
        metadata: {
          executionTime: Date.now(),
          cost: collatedResult.cost,
          tokens: collatedResult.tokens
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
}
