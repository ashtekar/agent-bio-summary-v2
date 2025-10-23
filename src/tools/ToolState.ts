/**
 * Shared State Management for LangChain Tools
 * 
 * LangChain tools are stateless, but passing large data (like 100 search results)
 * through tool arguments causes JSON truncation errors. This singleton provides
 * a shared state cache that tools can read from and write to.
 */

interface ToolState {
  searchResults?: any[];
  extractedArticles?: any[];
  scoredArticles?: any[];
  storedArticles?: any[];
  summaries?: any[];
  collatedSummary?: any;
  finalSummary?: string;
  metadata?: Record<string, any>;
  context?: any;  // Stores agent context including recipients, searchSettings, systemSettings
}

class ToolStateManager {
  private state: Map<string, ToolState> = new Map();

  /**
   * Get or create state for a session
   */
  getState(sessionId: string): ToolState {
    if (!this.state.has(sessionId)) {
      this.state.set(sessionId, {});
    }
    return this.state.get(sessionId)!;
  }

  /**
   * Update state for a session
   */
  updateState(sessionId: string, updates: Partial<ToolState>): void {
    const current = this.getState(sessionId);
    this.state.set(sessionId, { ...current, ...updates });
  }

  /**
   * Clear state for a session
   */
  clearState(sessionId: string): void {
    this.state.delete(sessionId);
  }

  /**
   * Get all session IDs
   */
  getSessions(): string[] {
    return Array.from(this.state.keys());
  }

  /**
   * Clean up old sessions (older than 1 hour)
   */
  cleanup(): void {
    // In a production system, you'd track timestamps and clean up old sessions
    // For now, just clear all if there are too many
    if (this.state.size > 100) {
      console.warn('Too many tool states cached, clearing all...');
      this.state.clear();
    }
  }
}

// Export singleton
export const toolStateManager = new ToolStateManager();

