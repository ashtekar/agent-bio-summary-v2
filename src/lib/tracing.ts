import { Client } from 'langsmith';
import { randomUUID } from 'crypto';

/**
 * Tracing wrapper for tool execution
 * Provides automatic LangSmith tracing for tools that don't use LangChain
 */
export class TracingWrapper {
  private client: Client | null;
  private projectName: string;
  private tracingDisabled: boolean = false;
  private failureCount: number = 0;
  private readonly MAX_FAILURES = 3;

  constructor() {
    const apiKey = process.env.LANGCHAIN_API_KEY;
    const tracingEnabled = process.env.LANGCHAIN_TRACING_V2 === 'true';
    const workspaceId = process.env.LANGSMITH_WORKSPACE_ID;
    const orgId = process.env.LANGCHAIN_ORG_ID;
    this.projectName = process.env.LANGCHAIN_PROJECT || 'agent-bio-summary-v2';

    if (apiKey && tracingEnabled) {
      try {
        this.client = new Client({
          apiKey,
          // Use org ID for hub operations, workspace ID for tracing
          ...(orgId && { workspaceId: orgId }),
          ...(!orgId && workspaceId && { workspaceId })
        });
      } catch (error) {
        console.warn('⚠️ Failed to initialize tracing client:', error);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  /**
   * Check if tracing should be disabled due to repeated failures
   */
  private shouldSkipTracing(): boolean {
    if (this.tracingDisabled) {
      return true;
    }
    if (this.failureCount >= this.MAX_FAILURES) {
      console.warn(`⚠️ Tracing disabled after ${this.MAX_FAILURES} consecutive failures`);
      this.tracingDisabled = true;
      return true;
    }
    return false;
  }

  /**
   * Handle tracing errors with special handling for 403 errors
   */
  private handleTracingError(toolName: string, error: any): void {
    this.failureCount++;
    
    // Check if this is a 403 Forbidden error
    const is403Error = error?.status === 403 || 
                       (error?.message && error.message.includes('403')) ||
                       (error?.message && error.message.includes('Forbidden'));
    
    if (is403Error) {
      if (this.failureCount === 1) {
        // Only log detailed message on first failure
        console.warn(`⚠️ [TRACING] LangSmith tracing disabled: 403 Forbidden. Please check your LANGCHAIN_API_KEY and workspace permissions.`);
      }
      // Disable tracing immediately for 403 errors to avoid spamming logs
      this.tracingDisabled = true;
    } else {
      // For other errors, log the error message
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️ [TRACING] Failed to create trace for ${toolName}:`, errorMessage);
    }
  }

  /**
   * Wrap tool execution with automatic tracing
   */
  async traceToolExecution<T>(
    toolName: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.client || this.shouldSkipTracing()) {
      // Tracing disabled or unavailable, just execute
      return await fn();
    }

    const startTime = Date.now();
    const runId = randomUUID();

    try {
      const result = await fn();
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Create run record in LangSmith (non-blocking, swallow errors)
      try {
        await this.client.createRun({
          id: runId,
          name: toolName,
          run_type: 'tool',
          inputs: metadata || {},
          start_time: startTime,
          end_time: endTime,
          project_name: this.projectName,
          extra: {
            duration_ms: duration,
            success: true
          }
        });
        // Reset failure count on success
        this.failureCount = 0;
      } catch (traceError) {
        // Tracing failed, but don't break the tool execution
        this.handleTracingError(toolName, traceError);
      }

      return result;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Log failed execution (non-blocking, swallow errors)
      if (!this.shouldSkipTracing()) {
        try {
          await this.client.createRun({
            id: runId,
            name: toolName,
            run_type: 'tool',
            inputs: metadata || {},
            start_time: startTime,
            end_time: endTime,
            project_name: this.projectName,
            error: error instanceof Error ? error.message : String(error),
            extra: {
              duration_ms: duration,
              success: false
            }
          });
          // Reset failure count on success
          this.failureCount = 0;
        } catch (traceError) {
          // Tracing failed, but don't break the error propagation
          this.handleTracingError(toolName, traceError);
        }
      }

      throw error;
    }
  }

  /**
   * Create a simple trace event
   */
  async logEvent(
    eventName: string,
    data: Record<string, any>
  ): Promise<void> {
    if (!this.client || this.shouldSkipTracing()) return;

    const timestamp = Date.now();

    try {
      await this.client.createRun({
        id: randomUUID(),
        name: eventName,
        run_type: 'tool',
        inputs: data,
        start_time: timestamp,
        end_time: timestamp,
        project_name: this.projectName
      });
      // Reset failure count on success
      this.failureCount = 0;
    } catch (error) {
      this.handleTracingError(eventName, error);
    }
  }
}

// Export singleton instance
export const tracingWrapper = new TracingWrapper();

