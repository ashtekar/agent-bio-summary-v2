import { SearchSettings, Article, ToolResult } from '@/types/agent';

export class SearchTools {
  private googleApiKey: string;
  private searchEngineId: string;

  constructor() {
    this.googleApiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || '';
    this.searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID || '';
    
    if (!this.googleApiKey || !this.searchEngineId) {
      console.warn('Google Custom Search API credentials not configured');
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
}
