import { SearchSettings, Article, ToolResult } from '@/types/agent';
import { createClient } from '@supabase/supabase-js';

export class SearchTools {
  private googleApiKey: string;
  private searchEngineId: string;
  private supabase;

  constructor() {
    this.googleApiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || '';
    this.searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID || '';
    
    if (!this.googleApiKey || !this.searchEngineId) {
      console.warn('Google Custom Search API credentials not configured');
    }

    // Initialize Supabase client for combined tool
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not configured');
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Search for articles using Google Custom Search API
   */
  async searchWeb(searchSettings: SearchSettings): Promise<ToolResult> {
    try {
      console.log(`Searching for articles with query: ${searchSettings.query}`);
      
      if (!this.googleApiKey || !this.searchEngineId) {
        throw new Error('Google Custom Search API credentials not configured');
      }

      const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
      searchUrl.searchParams.set('key', this.googleApiKey);
      searchUrl.searchParams.set('cx', this.searchEngineId);
      searchUrl.searchParams.set('q', searchSettings.query);
      searchUrl.searchParams.set('num', searchSettings.maxResults.toString());
      
      if (searchSettings.dateRange) {
        searchUrl.searchParams.set('dateRestrict', searchSettings.dateRange);
      }

      const response = await fetch(searchUrl.toString());
      
      if (!response.ok) {
        throw new Error(`Google Custom Search API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.items) {
        console.log('No search results found');
        return {
          success: true,
          data: []
        };
      }

      const searchResults = data.items.map((item: any) => ({
        id: this.generateArticleId(item.link),
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        publishedDate: this.parseDate(item.pagemap?.metatags?.[0]?.['article:published_time'] || item.pagemap?.metatags?.[0]?.['og:updated_time']),
        source: this.extractSource(item.displayLink),
        relevancyScore: 0 // Will be calculated later
      }));

      console.log(`Found ${searchResults.length} search results`);
      
      return {
        success: true,
        data: searchResults,
        metadata: {
          executionTime: Date.now(),
          cost: 0,
          tokens: 0
        }
      };

    } catch (error) {
      console.error('Search failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }

  /**
   * Extract full article content from URLs
   */
  async extractArticles(searchResults: any[]): Promise<ToolResult> {
    try {
      console.log(`Extracting content from ${searchResults.length} articles`);
      
      const articles: Article[] = [];
      
      // Process articles in parallel with concurrency limit
      const concurrencyLimit = 5;
      const chunks = this.chunkArray(searchResults, concurrencyLimit);
      
      for (const chunk of chunks) {
        const promises = chunk.map(async (result) => {
          try {
            const content = await this.extractArticleContent(result.url);
            return {
              ...result,
              content,
              relevancyScore: 0
            } as Article;
          } catch (error) {
            console.warn(`Failed to extract content from ${result.url}:`, error);
            // Provide more descriptive content for different error types
            let fallbackContent = result.snippet || 'Content extraction failed';
            if (error instanceof Error && error.message.includes('403')) {
              fallbackContent = `[Access Restricted - Using Title/Snippet Only] ${result.snippet || result.title}`;
            } else if (error instanceof Error && error.message.includes('404')) {
              fallbackContent = `[Page Not Found - Using Title/Snippet Only] ${result.snippet || result.title}`;
            }
            return {
              ...result,
              content: fallbackContent,
              relevancyScore: 0
            } as Article;
          }
        });
        
        const chunkResults = await Promise.all(promises);
        articles.push(...chunkResults);
      }

      console.log(`Successfully extracted content from ${articles.length} articles`);
      
      return {
        success: true,
        data: articles,
        metadata: {
          executionTime: Date.now(),
          cost: 0,
          tokens: 0
        }
      };

    } catch (error) {
      console.error('Article extraction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Article extraction failed'
      };
    }
  }

  /**
   * Extract content from a single article URL
   */
  private async extractArticleContent(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BioSummaryAgent/1.0)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Simple content extraction - in production, you might want to use a more sophisticated parser
      const content = this.extractTextFromHTML(html);
      
      return content;
      
    } catch (error) {
      console.warn(`Failed to extract content from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Simple HTML text extraction
   */
  private extractTextFromHTML(html: string): string {
    // Remove script and style elements
    const cleanHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Limit content length to prevent JSON parsing issues
    const maxLength = 2000;
    if (cleanHtml.length > maxLength) {
      console.warn(`Content truncated from ${cleanHtml.length} to ${maxLength} characters`);
      return cleanHtml.substring(0, maxLength) + '...';
    }
    
    return cleanHtml;
  }

  /**
   * Generate unique article ID from URL
   */
  private generateArticleId(url: string): string {
    const urlHash = Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substr(0, 16);
    return `article_${urlHash}`;
  }

  /**
   * Parse date from various formats
   */
  private parseDate(dateString: string | undefined): Date {
    if (!dateString) {
      return new Date();
    }
    
    try {
      return new Date(dateString);
    } catch {
      return new Date();
    }
  }

  /**
   * Extract source name from display link
   */
  private extractSource(displayLink: string): string {
    try {
      const url = new URL(`https://${displayLink}`);
      return url.hostname.replace('www.', '');
    } catch {
      return displayLink;
    }
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
   * COMBINED TOOL: Extract, Score, and Store Articles
   * This optimized tool combines three operations into one to reduce LLM round-trips
   * Phase 2B optimization as per Design Spec Section 9
   */
  async extractScoreAndStoreArticles(searchResults: any[], relevancyThreshold: number = 0.2): Promise<ToolResult> {
    const startTime = Date.now();
    
    try {
      console.log('='.repeat(80));
      console.log('[COMBINED TOOL] Starting extractScoreAndStoreArticles');
      console.log(`[COMBINED TOOL] Processing ${searchResults.length} search results`);
      console.log('='.repeat(80));

      // ============================================================
      // PHASE 1: EXTRACTION
      // ============================================================
      console.log('\n[PHASE 1: EXTRACTION] Extracting article content...');
      const extractionStartTime = Date.now();
      
      const articles: Article[] = [];
      const concurrencyLimit = 5;
      const chunks = this.chunkArray(searchResults, concurrencyLimit);
      
      for (const chunk of chunks) {
        const promises = chunk.map(async (result) => {
          try {
            console.log(`[Extract] Processing: ${result.url}`);
            const content = await this.extractArticleContent(result.url);
            console.log(`[Extract] ✓ Extracted ${content.length} chars from ${result.title}`);
            return {
              ...result,
              content,
              relevancyScore: 0
            } as Article;
          } catch (error) {
            console.warn(`[Extract] ✗ Failed to extract content from ${result.url}:`, error);
            let fallbackContent = result.snippet || 'Content extraction failed';
            if (error instanceof Error && error.message.includes('403')) {
              fallbackContent = `[Access Restricted - Using Title/Snippet Only] ${result.snippet || result.title}`;
            } else if (error instanceof Error && error.message.includes('404')) {
              fallbackContent = `[Page Not Found - Using Title/Snippet Only] ${result.snippet || result.title}`;
            }
            return {
              ...result,
              content: fallbackContent,
              relevancyScore: 0
            } as Article;
          }
        });
        
        const chunkResults = await Promise.all(promises);
        articles.push(...chunkResults);
      }

      const extractionTime = Date.now() - extractionStartTime;
      console.log(`[PHASE 1: EXTRACTION] ✓ Completed in ${extractionTime}ms`);
      console.log(`[PHASE 1: EXTRACTION] Successfully extracted ${articles.length} articles`);

      // ============================================================
      // PHASE 2: SCORING
      // ============================================================
      console.log('\n[PHASE 2: SCORING] Scoring articles for relevancy...');
      const scoringStartTime = Date.now();
      
      const scoredArticles = articles.map(article => {
        const score = this.calculateRelevancyScore(article);
        console.log(`[Score] ${article.title}: ${score.toFixed(3)}`);
        return {
          ...article,
          relevancyScore: score
        };
      });

      // Filter by relevancy threshold (from system settings, default 0.2)
      const threshold = relevancyThreshold;
      console.log(`[PHASE 2: SCORING] Using relevancy threshold: ${threshold} (from system settings)`);
      const relevantArticles = scoredArticles.filter(article => article.relevancyScore >= threshold);
      
      // Sort by relevancy score (highest first)
      relevantArticles.sort((a, b) => b.relevancyScore - a.relevancyScore);

      const scoringTime = Date.now() - scoringStartTime;
      console.log(`[PHASE 2: SCORING] ✓ Completed in ${scoringTime}ms`);
      console.log(`[PHASE 2: SCORING] ${relevantArticles.length}/${scoredArticles.length} articles passed threshold (${threshold})`);

      // ============================================================
      // PHASE 3: STORAGE
      // ============================================================
      console.log('\n[PHASE 3: STORAGE] Storing relevant articles in database...');
      const storageStartTime = Date.now();
      
      if (!this.supabase) {
        console.warn('[PHASE 3: STORAGE] ⚠ Supabase client not initialized, skipping storage');
      } else if (relevantArticles.length === 0) {
        console.log('[PHASE 3: STORAGE] No relevant articles to store');
      } else {
        // Prepare articles for database insertion
        const articlesToStore = relevantArticles.map(article => ({
          id: article.id,
          title: article.title || 'Untitled Article',
          url: article.url || 'https://unknown-source.com',
          content: article.content,
          published_date: article.publishedDate,
          source: article.source || 'unknown',
          relevancy_score: article.relevancyScore || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        // Upsert articles into database (handle duplicates gracefully)
        // Note: We use ignoreDuplicates:true to avoid "cannot affect row a second time" errors
        // when the LLM processes overlapping batches of articles
        const { data, error } = await this.supabase
          .from('articles')
          .upsert(articlesToStore, { 
            onConflict: 'id',
            ignoreDuplicates: true // Skip duplicates instead of updating
          })
          .select();

        if (error) {
          console.warn(`[PHASE 3: STORAGE] ⚠ Database upsert failed: ${error.message}`);
        } else {
          console.log(`[PHASE 3: STORAGE] ✓ Successfully stored ${data.length} articles`);
        }
      }

      const storageTime = Date.now() - storageStartTime;
      const totalTime = Date.now() - startTime;

      console.log(`[PHASE 3: STORAGE] ✓ Completed in ${storageTime}ms`);
      
      // ============================================================
      // SUMMARY
      // ============================================================
      console.log('\n' + '='.repeat(80));
      console.log('[COMBINED TOOL] Execution Summary:');
      console.log(`  • Total Time: ${totalTime}ms`);
      console.log(`  • Extraction: ${extractionTime}ms (${articles.length} articles)`);
      console.log(`  • Scoring: ${scoringTime}ms (${relevantArticles.length}/${articles.length} relevant)`);
      console.log(`  • Storage: ${storageTime}ms`);
      console.log(`  • Final Result: ${relevantArticles.length} relevant articles ready for summarization`);
      console.log('='.repeat(80));

      return {
        success: true,
        data: relevantArticles,
        metadata: {
          executionTime: totalTime,
          extractionTime,
          scoringTime,
          storageTime,
          totalArticles: articles.length,
          relevantArticles: relevantArticles.length,
          threshold,
          cost: 0,
          tokens: 0
        }
      };

    } catch (error) {
      console.error('[COMBINED TOOL] ✗ Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Extract, score, and store operation failed'
      };
    }
  }

  /**
   * Calculate relevancy score for an article
   * Implements the algorithmic scoring from ProcessingTools
   */
  private calculateRelevancyScore(article: Article): number {
    let score = 0;
    
    // Keywords that indicate synthetic biology relevance
    const syntheticBiologyKeywords = [
      'synthetic biology', 'bioengineering', 'genetic engineering',
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
      // Skip recency bonus if date parsing fails
    }
    
    // Ensure score is between 0 and 1
    return Math.min(Math.max(score, 0), 1);
  }
}
