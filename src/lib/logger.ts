/**
 * Logging utility for Agent Bio Summary V2
 * Provides structured logging for localhost development
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  sessionId?: string;
  executionId?: string;
}

class Logger {
  private level: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000; // Keep last 1000 logs in memory

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any,
    sessionId?: string,
    executionId?: string
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      sessionId,
      executionId,
    };
  }

  private log(entry: LogEntry): void {
    // Add to memory store
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Console output with colors
    const levelNames = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
    const colors = ['\x1b[31m', '\x1b[33m', '\x1b[36m', '\x1b[90m']; // Red, Yellow, Cyan, Gray
    const reset = '\x1b[0m';

    const timestamp = entry.timestamp.split('T')[1].split('.')[0]; // HH:MM:SS
    const contextStr = entry.context ? `[${entry.context}]` : '';
    const sessionStr = entry.sessionId ? `[${entry.sessionId.slice(0, 8)}]` : '';
    
    console.log(
      `${colors[entry.level]}${levelNames[entry.level].padEnd(5)}${reset} ` +
      `${timestamp} ${contextStr}${sessionStr} ${entry.message}`
    );

    // Log structured data if present
    if (entry.data) {
      console.log('  Data:', JSON.stringify(entry.data, null, 2));
    }
  }

  error(message: string, context?: string, data?: any, sessionId?: string, executionId?: string): void {
    if (this.level >= LogLevel.ERROR) {
      this.log(this.createLogEntry(LogLevel.ERROR, message, context, data, sessionId, executionId));
    }
  }

  warn(message: string, context?: string, data?: any, sessionId?: string, executionId?: string): void {
    if (this.level >= LogLevel.WARN) {
      this.log(this.createLogEntry(LogLevel.WARN, message, context, data, sessionId, executionId));
    }
  }

  info(message: string, context?: string, data?: any, sessionId?: string, executionId?: string): void {
    if (this.level >= LogLevel.INFO) {
      this.log(this.createLogEntry(LogLevel.INFO, message, context, data, sessionId, executionId));
    }
  }

  debug(message: string, context?: string, data?: any, sessionId?: string, executionId?: string): void {
    if (this.level >= LogLevel.DEBUG) {
      this.log(this.createLogEntry(LogLevel.DEBUG, message, context, data, sessionId, executionId));
    }
  }

  // Agent-specific logging methods
  agentStart(agentName: string, sessionId: string, context?: any): void {
    this.info(`Agent ${agentName} started`, 'AGENT', context, sessionId);
  }

  agentComplete(agentName: string, sessionId: string, result?: any): void {
    this.info(`Agent ${agentName} completed`, 'AGENT', result, sessionId);
  }

  agentError(agentName: string, sessionId: string, error: Error): void {
    this.error(`Agent ${agentName} failed: ${error.message}`, 'AGENT', { stack: error.stack }, sessionId);
  }

  toolExecution(toolName: string, sessionId: string, input?: any, output?: any): void {
    this.info(`Tool ${toolName} executed`, 'TOOL', { input, output }, sessionId);
  }

  llmCall(model: string, sessionId: string, input?: any, output?: any): void {
    this.info(`LLM ${model} called`, 'LLM', { input, output }, sessionId);
  }

  databaseOperation(operation: string, sessionId: string, data?: any): void {
    this.debug(`Database ${operation}`, 'DB', data, sessionId);
  }

  externalApiCall(service: string, endpoint: string, sessionId: string, status?: number): void {
    this.info(`External API ${service}:${endpoint}`, 'API', { status }, sessionId);
  }

  // Utility methods
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level <= level);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }
}

// Create singleton logger instance
export const logger = new Logger(
  process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
);

// Export types and logger
export { Logger };
export default logger;


