import { Client } from 'langsmith';
import { randomUUID } from 'crypto';

/**
 * Tracing wrapper for tool execution
 * Provides automatic LangSmith tracing for tools that don't use LangChain
 */
export class TracingWrapper {
  private client: Client | null;
  private projectName: string;

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
   * Wrap tool execution with automatic tracing
   */
  async traceToolExecution<T>(
    toolName: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.client) {
      // Tracing disabled, just execute
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
      } catch (traceError) {
        // Tracing failed, but don't break the tool execution
        console.warn(`Failed to create trace for ${toolName}:`, traceError instanceof Error ? traceError.message : traceError);
      }

      return result;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Log failed execution (non-blocking, swallow errors)
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
      } catch (traceError) {
        // Tracing failed, but don't break the error propagation
        console.warn(`Failed to create error trace for ${toolName}:`, traceError instanceof Error ? traceError.message : traceError);
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
    if (!this.client) return;

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
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  }
}

// Export singleton instance
export const tracingWrapper = new TracingWrapper();

