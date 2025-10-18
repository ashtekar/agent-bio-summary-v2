import { Article, ArticleSummary, ToolResult, EvaluationResult } from '@/types/agent';
import { langchainIntegration } from '@/lib/langchain';

export class SummaryTools {
  private langchain: any;

  constructor(modelConfig?: {
    modelName?: string;
    temperature?: number;
    maxTokens?: number;
  }) {
    // Create a new instance with gpt-5-nano for collation
    this.langchain = new (langchainIntegration.constructor as any)({
      modelName: 'gpt-5-nano', // Using gpt-5-nano for collation
      // Remove temperature (not supported by gpt-5-nano)
      maxTokens: modelConfig?.maxTokens || 2000,
      reasoning_effort: 'minimal' // Reduce token consumption
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
            const summaryResult = await this.langchain.generateSummary({
              title: article.title,
              url: article.url,
              content: article.content.substring(0, 4000) // Limit content length
            });
            
            // Evaluate the summary quality using LLM-as-a-judge
            const evaluationResult = await this.langchain.evaluateSummary({
              title: article.title,
              url: article.url,
              summary: summaryResult.summary
            });
            
            // Link evaluation score to trace via annotation
            if (summaryResult.runId) {
              await this.langchain.addAnnotation({
                runId: summaryResult.runId,
                annotation: {
                  type: evaluationResult.overallScore >= 0.5 ? 'pass' : 'fail',
                  score: evaluationResult.overallScore,
                  feedback: evaluationResult.feedback,
                  evaluator: 'gpt-4o-mini',
                  metadata: {
                    coherence: evaluationResult.coherence,
                    accuracy: evaluationResult.accuracy,
                    completeness: evaluationResult.completeness,
                    readability: evaluationResult.readability
                  }
                }
              });
            }
            
            totalCost += summaryResult.cost;
            totalTokens += summaryResult.tokens;
            
            return {
              articleId: article.id,
              summary: summaryResult.summary,
              keyPoints: this.extractKeyPoints(summaryResult.summary),
              qualityScore: evaluationResult.overallScore,
              evaluationResults: evaluationResult
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
      
      // Filter out low-quality summaries
      const qualityThreshold = 0.5;
      const qualitySummaries = summaries.filter(s => s.qualityScore >= qualityThreshold);
      
      if (qualitySummaries.length === 0) {
        throw new Error('No high-quality summaries available for collation');
      }

      // Generate collated summary using Langchain
      const summaryTexts = qualitySummaries.map(s => s.summary);
      const collatedResult = await this.langchain.generateCollatedSummary(summaryTexts);
      
      // Evaluate the collated summary using LLM-as-a-judge
      const evaluationResult = await this.langchain.evaluateCollatedSummary(
        collatedResult.summary, 
        qualitySummaries.length
      );
      
      // Link collated evaluation score to trace via annotation
      if (collatedResult.runId) {
        await this.langchain.addAnnotation({
          runId: collatedResult.runId,
          annotation: {
            type: evaluationResult.overallScore >= 0.5 ? 'pass' : 'fail',
            score: evaluationResult.overallScore,
            feedback: evaluationResult.feedback,
            evaluator: 'gpt-4o-mini',
            metadata: {
              coherence: evaluationResult.coherence,
              accuracy: evaluationResult.accuracy,
              completeness: evaluationResult.completeness,
              readability: evaluationResult.readability,
              summaryCount: qualitySummaries.length,
              evaluationType: 'collated_summary'
            }
          }
        });
      }
      
      console.log(`Successfully collated summaries (Quality score: ${evaluationResult.overallScore})`);
      
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
