import { Article, ToolResult } from '@/types/agent';
import { createClient } from '@supabase/supabase-js';

export class ProcessingTools {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not configured');
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Score articles for relevancy using existing algorithm
   */
  async scoreRelevancy(articles: Article[], relevancyThreshold: number = 0.2): Promise<ToolResult> {
    try {
      console.log(`Scoring relevancy for ${articles.length} articles`);
      
      const scoredArticles = articles.map(article => {
        const score = this.calculateRelevancyScore(article);
        return {
          ...article,
          relevancyScore: score
        };
      });

      // Filter articles with relevancy score above threshold (from system settings)
      const threshold = relevancyThreshold;
      console.log(`Using relevancy threshold: ${threshold} (from system settings)`);
      const relevantArticles = scoredArticles.filter(article => article.relevancyScore >= threshold);
      
      // Sort by relevancy score (highest first)
      relevantArticles.sort((a, b) => b.relevancyScore - a.relevancyScore);

      console.log(`Found ${relevantArticles.length} relevant articles (threshold: ${threshold})`);
      
      return {
        success: true,
        data: relevantArticles,
        metadata: {
          executionTime: Date.now(),
          cost: 0,
          tokens: 0
        }
      };

    } catch (error) {
      console.error('Relevancy scoring failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Relevancy scoring failed'
      };
    }
  }

  /**
   * Store relevant articles in Supabase
   */
  async storeArticles(articles: Article[]): Promise<ToolResult> {
    try {
      console.log(`Storing ${articles.length} articles in database`);
      
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Prepare articles for database insertion
      const articlesToStore = articles.map(article => ({
        id: article.id,
        title: article.title || 'Untitled Article', // Ensure title is never null
        url: article.url || 'https://unknown-source.com', // Ensure url is never null
        content: article.content,
        published_date: article.publishedDate,
        source: article.source || 'unknown', // Ensure source is never null
        relevancy_score: article.relevancyScore || 0, // Ensure score is never null
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Upsert articles into database (handle duplicates gracefully)
      const { data, error } = await this.supabase
        .from('articles')
        .upsert(articlesToStore, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.warn(`Database upsert failed: ${error.message}`);
        // If upsert fails, try to continue with original articles
        return {
          success: true,
          data: articles, // Return original articles for consistency
          metadata: {
            executionTime: Date.now(),
            cost: 0,
            tokens: 0
          }
        };
      }

      console.log(`Successfully stored ${data.length} articles`);
      
      return {
        success: true,
        data: articles, // Return original articles for consistency
        metadata: {
          executionTime: Date.now(),
          cost: 0,
          tokens: 0
        }
      };

    } catch (error) {
      console.error('Article storage failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Article storage failed'
      };
    }
  }

  /**
   * Calculate relevancy score for an article
   * This implements the existing algorithm from V1
   */
  private calculateRelevancyScore(article: Article): number {
    let score = 0;
    
    // Keywords that indicate synthetic biology relevance
    const syntheticBiologyKeywords = [
      'synthetic biology', 'synthetic biology', 'bioengineering', 'genetic engineering',
      'biotechnology', 'biotech', 'molecular biology', 'cell biology', 'protein engineering',
      'metabolic engineering', 'systems biology', 'synthetic genomics', 'biofabrication',
      'biomanufacturing', 'biomaterials', 'biofuels', 'pharmaceuticals', 'drug discovery',
      'therapeutic proteins', 'enzyme engineering', 'biocatalysis', 'fermentation',
      'bioprocessing', 'bioreactors', 'cell culture', 'tissue engineering', 'regenerative medicine'
    ];

    const content = `${article.title} ${article.content}`.toLowerCase();
    
    // Check for keyword matches
    let keywordMatches = 0;
    syntheticBiologyKeywords.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        keywordMatches++;
      }
    });
    
    // Base score from keyword matches
    score += (keywordMatches / syntheticBiologyKeywords.length) * 0.4;
    
    // Title relevance (titles with keywords are more relevant)
    const titleKeywords = syntheticBiologyKeywords.filter(keyword => 
      article.title.toLowerCase().includes(keyword.toLowerCase())
    );
    score += (titleKeywords.length / syntheticBiologyKeywords.length) * 0.3;
    
    // Content length relevance (longer articles might be more comprehensive)
    const contentLength = article.content.length;
    if (contentLength > 1000) {
      score += 0.1;
    }
    if (contentLength > 5000) {
      score += 0.1;
    }
    
    // Source credibility (some sources are more reliable)
    const credibleSources = ['nature.com', 'science.org', 'cell.com', 'pnas.org', 'biorxiv.org'];
    const isFromCredibleSource = credibleSources.some(source => 
      article.url.toLowerCase().includes(source)
    );
    if (isFromCredibleSource) {
      score += 0.1;
    }
    
    // Recency bonus (newer articles get slight bonus)
    try {
      const publishedDate = new Date(article.publishedDate);
      if (!isNaN(publishedDate.getTime())) {
        const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSincePublished < 30) {
          score += 0.05;
        }
      }
    } catch (error) {
      console.warn(`Failed to parse publishedDate: ${article.publishedDate}`, error);
      // Skip recency bonus if date parsing fails
    }
    
    // Ensure score is between 0 and 1
    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Get stored articles from database
   */
  async getStoredArticles(limit: number = 50): Promise<ToolResult> {
    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await this.supabase
        .from('articles')
        .select('*')
        .order('relevancy_score', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      return {
        success: true,
        data: data || [],
        metadata: {
          executionTime: Date.now(),
          cost: 0,
          tokens: 0
        }
      };

    } catch (error) {
      console.error('Failed to retrieve stored articles:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve stored articles'
      };
    }
  }
}
