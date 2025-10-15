/**
 * Basic tests to verify Jest setup is working
 */

describe('Basic Test Setup', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('should have access to Next.js environment', () => {
    expect(process.env.NEXT_PUBLIC_BASE_URL).toBe('http://localhost:3000');
  });
});







