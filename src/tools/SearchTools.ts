import { SearchSettings, Article, ToolResult } from '@/types/agent';
import { createClient } from '@supabase/supabase-js';
import { tracingWrapper } from '@/lib/tracing';

export class SearchTools {
  private googleApiKey: string;
  private searchEngineId: string;
  private supabase;
  private tracing = tracingWrapper;

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
   * Make HTTP request with exponential backoff retry for rate limiting
   */
  private async makeRequestWithRetry(url: string, attempt: number = 1): Promise<Response> {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second base delay
    
    try {
      const response = await fetch(url);
      
      // If we get a 429 (rate limit) and haven't exceeded max retries, retry with backoff
      if (response.status === 429 && attempt <= maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.warn(`Rate limited (429). Retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequestWithRetry(url, attempt + 1);
      }
      
      return response;
    } catch (error) {
      // If it's a network error and we haven't exceeded max retries, retry
      if (attempt <= maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.warn(`Network error. Retrying in ${delay}ms (attempt ${attempt}/${maxRetries}):`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequestWithRetry(url, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Search for articles using Google Custom Search API
   * Implements pagination to fetch up to 100 results (Google API limit: 10 per request, max 100 total)
   */
  async searchWeb(searchSettings: SearchSettings): Promise<ToolResult> {
    return this.tracing.traceToolExecution(
      'searchWeb',
      async () => {
        console.log(`Searching for articles with query: ${searchSettings.query}`);
        
        if (!this.googleApiKey || !this.searchEngineId) {
          throw new Error('Google Custom Search API credentials not configured');
        }

        // Google Custom Search API limits:
        // - 10 results per request (max)
        // - 100 results total (max)
        const maxResultsPerRequest = 10;
        const absoluteMaxResults = 100;
        const targetResults = Math.min(searchSettings.maxResults, absoluteMaxResults);
        const numRequests = Math.ceil(targetResults / maxResultsPerRequest);
        
        let allResults: any[] = [];
        
        // Make paginated requests
        for (let i = 0; i < numRequests; i++) {
          const startIndex = i * maxResultsPerRequest + 1; // Google API uses 1-based indexing
          const resultsToFetch = Math.min(maxResultsPerRequest, targetResults - allResults.length);
          
          const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
          searchUrl.searchParams.set('key', this.googleApiKey);
          searchUrl.searchParams.set('cx', this.searchEngineId);
          
          // Build restricted query using sources
          const restrictedQuery = this.buildRestrictedQuery(searchSettings.query, searchSettings.sources);
          searchUrl.searchParams.set('q', restrictedQuery);
          searchUrl.searchParams.set('num', resultsToFetch.toString());
          searchUrl.searchParams.set('start', startIndex.toString());
          
          if (searchSettings.dateRange) {
            searchUrl.searchParams.set('dateRestrict', searchSettings.dateRange);
          }

          console.log(`Searching with restricted query: ${restrictedQuery}`);
          console.log(`Fetching results ${startIndex} to ${startIndex + resultsToFetch - 1}...`);
          
          const response = await this.makeRequestWithRetry(searchUrl.toString(), i + 1);
          
          if (!response.ok) {
            // If pagination fails (e.g., no more results), return what we have so far
            if (allResults.length > 0) {
              console.warn(`Pagination request ${i + 1} failed, returning ${allResults.length} results collected so far`);
              break;
            }
            throw new Error(`Google Custom Search API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          
          if (!data.items || data.items.length === 0) {
            console.log(`No more results found after ${allResults.length} results`);
            break;
          }
          
          allResults = allResults.concat(data.items);
          console.log(`Collected ${allResults.length} results so far...`);
          
          // Stop if we've reached the target or there are no more results
          if (allResults.length >= targetResults || data.items.length < resultsToFetch) {
            break;
          }
          
          // Delay to respect rate limits - increased for better reliability
          if (i < numRequests - 1) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Increased from 100ms to 500ms
          }
        }
        
        if (allResults.length === 0) {
          console.log('No search results found');
          return {
            success: true,
            data: []
          };
        }

        console.log(`Total results collected: ${allResults.length}`);
        const searchResults = allResults.map((item: any) => ({
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
      },
      {
        query: searchSettings.query,
        maxResults: searchSettings.maxResults,
        dateRange: searchSettings.dateRange,
        sources: searchSettings.sources
      }
    ).catch(error => {
      console.error('Search failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed'
      };
    });
  }

  /**
   * Extract full article content from URLs
   */
  async extractArticles(searchResults: any[]): Promise<ToolResult> {
    return this.tracing.traceToolExecution(
      'extractArticles',
      async () => {
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
      },
      {
        articleCount: searchResults.length,
        concurrencyLimit: 5
      }
    ).catch(error => {
      console.error('Article extraction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Article extraction failed'
      };
    });
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
   * Build restricted query using Google's site: operator
   * Converts sources array to site: restrictions in the search query
   */
  private buildRestrictedQuery(query: string, sources: string[]): string {
    if (!sources || sources.length === 0) {
      return query;
    }
    
    // Clean up source domains (remove protocols, www, etc.)
    const cleanSources = sources.map(source => {
      return source
        .replace(/^https?:\/\//, '')  // Remove http:// or https://
        .replace(/^www\./, '')        // Remove www.
        .split('/')[0];               // Take only domain part
    });
    
    // Handle single source efficiently
    if (cleanSources.length === 1) {
      return `${query} site:${cleanSources[0]}`;
    }
    
    // Handle multiple sources with OR operator
    const siteRestrictions = cleanSources.map(source => `site:${source}`).join(' OR ');
    return `${query} (${siteRestrictions})`;
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
  async extractScoreAndStoreArticles(searchResults: any[], relevancyThreshold: number = 0.2, searchSettings?: SearchSettings): Promise<ToolResult> {
    return this.tracing.traceToolExecution(
      'extractScoreAndStoreArticles',
      async () => {
        const startTime = Date.now();
        
        try {
      console.log('='.repeat(80));
      console.log(`[EXTRACT-SCORE-STORE] Processing ${searchResults.length} results`);
      console.log('='.repeat(80));

      // ============================================================
      // PHASE 1: EXTRACTION
      // ============================================================
      console.log('[PHASE 1] Extracting content...');
      const extractionStartTime = Date.now();
      
      const articles: Article[] = [];
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
      console.log(`[PHASE 1] Extracted ${articles.length} articles in ${extractionTime}ms`);

      // ============================================================
      // PHASE 2: DUPLICATE CHECKING
      // ============================================================
      console.log('[PHASE 2] Checking duplicates...');
      const duplicateCheckStartTime = Date.now();
      
      const existingUrls = await this.getExistingArticleUrls(articles);
      // Filter out existing articles - only process new ones
      const newArticles = articles.filter(article => !existingUrls.includes(article.url));
      const duplicateCheckTime = Date.now() - duplicateCheckStartTime;
      console.log(`[PHASE 2] Found ${existingUrls.length} duplicates, ${newArticles.length} new articles in ${duplicateCheckTime}ms`);

      // ============================================================
      // PHASE 3: SCORING (only for new articles)
      // ============================================================
      console.log('[PHASE 3] Scoring new articles...');
      const scoringStartTime = Date.now();
      
      // Extract user keywords from search settings
      const userKeywords = searchSettings?.query ? 
        searchSettings.query.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0) : 
        [];
      
      
      const scoredNewArticles = newArticles.map(article => {
        const score = this.calculateRelevancyScore(article, userKeywords);
        return {
          ...article,
          relevancyScore: score
        };
      });

      // Filter by relevancy threshold (from system settings, default 0.2)
      const threshold = relevancyThreshold;
      const relevantNewArticles = scoredNewArticles.filter(article => article.relevancyScore >= threshold);
      
      // Sort by relevancy score (highest first)
      relevantNewArticles.sort((a, b) => b.relevancyScore - a.relevancyScore);

      const scoringTime = Date.now() - scoringStartTime;
      console.log(`[PHASE 3] Scored ${scoredNewArticles.length} articles, ${relevantNewArticles.length} passed threshold in ${scoringTime}ms`);

      // ============================================================
      // PHASE 4: STORAGE (only new relevant articles)
      // ============================================================
      console.log('[PHASE 4] Storing articles...');
      const storageStartTime = Date.now();
      
      if (!this.supabase) {
        console.warn('[PHASE 4] Supabase not initialized, skipping storage');
      } else if (relevantNewArticles.length === 0) {
        console.log('[PHASE 4] No relevant articles to store');
      } else {
        // Prepare articles for database insertion
        const articlesToStore = relevantNewArticles.map(article => ({
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
          console.warn(`[PHASE 4: STORAGE] ⚠ Database upsert failed: ${error.message}`);
        } else {
          console.log(`[PHASE 4] Stored ${data.length} articles`);
        }
      }

      const storageTime = Date.now() - storageStartTime;
      const totalTime = Date.now() - startTime;

      console.log(`[PHASE 4] Completed in ${storageTime}ms`);
      
      // ============================================================
      // SUMMARY
      // ============================================================
      console.log('\n' + '='.repeat(80));
      console.log('[EXTRACT-SCORE-STORE] Summary:');
      console.log(`  • Total Time: ${totalTime}ms`);
      console.log(`  • Extraction: ${extractionTime}ms (${articles.length} articles)`);
      console.log(`  • Duplicate Check: ${duplicateCheckTime}ms (${articles.length - newArticles.length} duplicates skipped)`);
      console.log(`  • Scoring: ${scoringTime}ms (${relevantNewArticles.length}/${newArticles.length} new articles relevant)`);
      console.log(`  • Storage: ${storageTime}ms (${relevantNewArticles.length} new articles stored)`);
      console.log(`  • Final Result: ${relevantNewArticles.length} new relevant articles ready for summarization`);
      console.log('='.repeat(80));

          return {
            success: true,
            data: relevantNewArticles, // Return only new relevant articles
            metadata: {
              executionTime: totalTime,
              extractionTime,
              duplicateCheckTime,
              scoringTime,
              storageTime,
              totalArticles: articles.length,
              newArticles: newArticles.length,
              duplicateArticles: articles.length - newArticles.length,
              relevantNewArticles: relevantNewArticles.length,
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
      },
      {
        searchResultsCount: searchResults.length,
        relevancyThreshold,
        operation: 'combined_extract_score_store'
      }
    ).catch(error => {
      console.error('[COMBINED TOOL] Tracing wrapper error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Extract, score, and store operation failed'
      };
    });
  }

  /**
   * Get URLs of articles that already exist in the database
   */
  private async getExistingArticleUrls(articles: Article[]): Promise<string[]> {
    if (!this.supabase || articles.length === 0) {
      return [];
    }

    try {
      const urls = articles.map(article => article.url);
      const { data, error } = await this.supabase
        .from('articles')
        .select('url')
        .in('url', urls);

      if (error) {
        console.warn(`[DUPLICATE CHECK] Failed to check existing articles: ${error.message}`);
        return [];
      }

      return data.map(row => row.url);
    } catch (error) {
      console.warn(`[DUPLICATE CHECK] Error checking existing articles:`, error);
      return [];
    }
  }

  /**
   * Calculate relevancy score for an article using user settings
   * Replaces hardcoded keywords with user's search query
   */
  private calculateRelevancyScore(article: Article, userKeywords: string[]): number {
    let score = 0;
    
    const content = `${article.title} ${article.content}`.toLowerCase();
    
    // 1. User's search keywords (80% weight) - PRIMARY SIGNAL
    if (userKeywords && userKeywords.length > 0) {
      const keywordMatches = userKeywords.filter(keyword => 
        content.includes(keyword.toLowerCase().trim())
      );
      score += (keywordMatches.length / userKeywords.length) * 0.8;
    }
    
    // 2. Article freshness (20% weight) - SECONDARY SIGNAL
    try {
      const publishedDate = new Date(article.publishedDate);
      if (!isNaN(publishedDate.getTime())) {
        const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
        let freshnessScore = 0.6; // Default for old articles
        
        if (daysSincePublished < 7) {
          freshnessScore = 1.0; // Very recent
        } else if (daysSincePublished < 30) {
          freshnessScore = 0.8; // Recent
        } else if (daysSincePublished < 90) {
          freshnessScore = 0.7; // Somewhat recent
        }
        
        score += freshnessScore * 0.2;
      }
    } catch (error) {
      // Skip freshness bonus if date parsing fails, but still give baseline score
      score += 0.6 * 0.2;
    }
    
    // Ensure score is between 0 and 1
    return Math.min(Math.max(score, 0), 1);
  }

  // COMMENTED OUT: Old hardcoded relevance scoring (kept for future Option 2 reference)
  /*
  private calculateRelevancyScore_Legacy(article: Article): number {
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
  */
}
