import { Logger, LogLevel } from '../logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new Logger(LogLevel.DEBUG);
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Basic Logging', () => {
    it('should log info messages', () => {
      logger.info('Test info message', 'TEST');
      
      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toContain('INFO');
      expect(logCall).toContain('[TEST]');
      expect(logCall).toContain('Test info message');
    });

    it('should log error messages', () => {
      logger.error('Test error message', 'TEST');
      
      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toContain('ERROR');
      expect(logCall).toContain('[TEST]');
      expect(logCall).toContain('Test error message');
    });

    it('should respect log levels', () => {
      logger.setLevel(LogLevel.ERROR);
      logger.info('This should not log', 'TEST');
      logger.error('This should log', 'TEST');
      
      expect(consoleSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Agent-specific Logging', () => {
    it('should log agent start', () => {
      logger.agentStart('TestAgent', 'session-123', { test: 'data' });
      
      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toContain('Agent TestAgent started');
      expect(logCall).toContain('[AGENT]');
      expect(logCall).toContain('[session-'); // Session ID is truncated to 8 chars
    });

    it('should log tool execution', () => {
      logger.toolExecution('searchWeb', 'session-123', { query: 'test' }, { results: [] });
      
      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toContain('Tool searchWeb executed');
      expect(logCall).toContain('[TOOL]');
    });
  });

  describe('Log Management', () => {
    it('should store logs in memory', () => {
      logger.info('Test message', 'TEST');
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Test message');
      expect(logs[0].context).toBe('TEST');
    });

    it('should clear logs', () => {
      logger.info('Test message', 'TEST');
      logger.clearLogs();
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(0);
    });

    it('should export logs as JSON', () => {
      logger.info('Test message', 'TEST');
      
      const exported = logger.exportLogs();
      const parsed = JSON.parse(exported);
      
      expect(parsed).toHaveLength(1);
      expect(parsed[0].message).toBe('Test message');
    });
  });
});
