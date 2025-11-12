/**
 * Shared State Management for LangChain Tools
 * 
 * LangChain tools are stateless, but passing large data (like 100 search results)
 * through tool arguments causes JSON truncation errors. This singleton provides
 * a shared state cache that tools can read from and write to.
 * 
 * Updated for user isolation: Session keys now include userId to ensure
 * tool state is isolated per user.
 */

export interface ToolState {
  userId: string;  // User ID for isolation
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

interface SessionMetadata {
  createdAt: Date;
  lastAccess: Date;
}

class ToolStateManager {
  private state: Map<string, ToolState> = new Map();
  private sessionTimestamps: Map<string, SessionMetadata> = new Map();

  /**
   * Generate session key from userId and sessionId
   */
  private getSessionKey(userId: string, sessionId: string): string {
    return `${userId}:${sessionId}`;
  }

  /**
   * Get or create state for a session (user-scoped)
   * @param sessionId - Session ID
   * @param userId - User ID (required for isolation)
   */
  getState(sessionId: string, userId: string): ToolState {
    const key = this.getSessionKey(userId, sessionId);
    
    if (!this.state.has(key)) {
      this.state.set(key, { userId });
      this.sessionTimestamps.set(key, {
        createdAt: new Date(),
        lastAccess: new Date()
      });
    } else {
      // Update last access time
      const metadata = this.sessionTimestamps.get(key);
      if (metadata) {
        metadata.lastAccess = new Date();
      }
    }
    
    return this.state.get(key)!;
  }

  /**
   * Update state for a session (user-scoped)
   * @param sessionId - Session ID
   * @param userId - User ID (required for isolation)
   * @param updates - State updates
   */
  updateState(sessionId: string, userId: string, updates: Partial<ToolState>): void {
    const key = this.getSessionKey(userId, sessionId);
    const current = this.getState(sessionId, userId);
    this.state.set(key, { ...current, ...updates });
    
    // Update last access time
    const metadata = this.sessionTimestamps.get(key);
    if (metadata) {
      metadata.lastAccess = new Date();
    }
  }

  /**
   * Clear state for a session (user-scoped)
   * @param sessionId - Session ID
   * @param userId - User ID (required for isolation)
   */
  clearState(sessionId: string, userId: string): void {
    const key = this.getSessionKey(userId, sessionId);
    this.state.delete(key);
    this.sessionTimestamps.delete(key);
  }

  /**
   * Get all session IDs for a specific user
   * @param userId - User ID
   */
  getUserSessions(userId: string): string[] {
    const sessions: string[] = [];
    const prefix = `${userId}:`;
    
    for (const [key, state] of this.state.entries()) {
      if (key.startsWith(prefix) && state.userId === userId) {
        // Extract sessionId from key (remove userId: prefix)
        const sessionId = key.substring(prefix.length);
        sessions.push(sessionId);
      }
    }
    
    return sessions;
  }

  /**
   * Clear all sessions for a user
   * @param userId - User ID
   */
  clearUserSessions(userId: string): void {
    const sessions = this.getUserSessions(userId);
    for (const sessionId of sessions) {
      this.clearState(sessionId, userId);
    }
  }

  /**
   * Get all session IDs (for debugging)
   */
  getSessions(): string[] {
    return Array.from(this.state.keys());
  }

  /**
   * Clean up expired sessions (older than specified TTL)
   * @param ttlMinutes - Time to live in minutes (default: 60 minutes)
   */
  cleanup(ttlMinutes: number = 60): void {
    const now = new Date();
    const ttlMs = ttlMinutes * 60 * 1000;
    const keysToDelete: string[] = [];

    for (const [key, metadata] of this.sessionTimestamps.entries()) {
      const age = now.getTime() - metadata.lastAccess.getTime();
      if (age > ttlMs) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.state.delete(key);
      this.sessionTimestamps.delete(key);
    }

    if (keysToDelete.length > 0) {
      console.log(`🧹 Cleaned up ${keysToDelete.length} expired tool sessions`);
    }

    // Fallback: clear all if there are too many sessions
    if (this.state.size > 1000) {
      console.warn('Too many tool states cached, clearing all...');
      this.state.clear();
      this.sessionTimestamps.clear();
    }
  }
}

// Export singleton
export const toolStateManager = new ToolStateManager();

