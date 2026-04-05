import { describe, it, expect, vi, afterEach } from 'vitest';

import { detectMixedContent, testConnectionWithRetries, validateRobotForm } from './helpers';

describe('detectMixedContent', () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'location');

  afterEach(() => {
    if (originalDescriptor) {
      Object.defineProperty(window, 'location', originalDescriptor);
    }
  });

  function setProtocol(protocol: string) {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { protocol },
    });
  }

  it('returns true for ws:// URL on HTTPS page', () => {
    setProtocol('https:');
    expect(detectMixedContent('ws://192.168.1.100:9090')).toBe(true);
  });

  it('returns false for wss:// URL on HTTPS page', () => {
    setProtocol('https:');
    expect(detectMixedContent('wss://192.168.1.100:9090')).toBe(false);
  });

  it('returns false for ws:// URL on HTTP page', () => {
    setProtocol('http:');
    expect(detectMixedContent('ws://192.168.1.100:9090')).toBe(false);
  });

  it('returns false for empty URL', () => {
    setProtocol('https:');
    expect(detectMixedContent('')).toBe(false);
  });
});

describe('validateRobotForm', () => {
  it('returns errors when name is empty', () => {
    const result = validateRobotForm('', 'ws://localhost:9090');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.name).toBeDefined();
    }
  });

  it('returns errors when url is empty', () => {
    const result = validateRobotForm('Atlas', '');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.url).toBeDefined();
    }
  });

  it('returns normalized url on valid input', () => {
    const result = validateRobotForm('Atlas', '192.168.1.100:9090');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.name).toBe('Atlas');
      expect(result.url).toContain('192.168.1.100');
    }
  });

  it('returns url error for garbage input', () => {
    const result = validateRobotForm('Atlas', '://not-a-url');
    expect(result.ok).toBe(false);
  });
});

describe('testConnectionWithRetries', () => {
  it('returns connected on first success', async () => {
    const tester = vi.fn().mockResolvedValue(undefined);
    const onAttempt = vi.fn();

    const result = await testConnectionWithRetries('ws://localhost:9090', onAttempt, tester);

    expect(result.connected).toBe(true);
    expect(onAttempt).toHaveBeenCalledWith(1);
    expect(tester).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and succeeds on third attempt', async () => {
    let callCount = 0;
    const tester = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount < 3) return Promise.reject(new Error('fail'));
      return Promise.resolve(undefined);
    });
    const onAttempt = vi.fn();

    const result = await testConnectionWithRetries('ws://localhost:9090', onAttempt, tester);

    expect(result.connected).toBe(true);
    expect(onAttempt).toHaveBeenCalledTimes(3);
  });

  it('returns error after exhausting all attempts', async () => {
    const tester = vi.fn().mockRejectedValue(new Error('fail'));
    const onAttempt = vi.fn();

    const result = await testConnectionWithRetries('ws://localhost:9090', onAttempt, tester);

    expect(result.connected).toBe(false);
    if (!result.connected) {
      expect(result.error).toContain('Failed after');
    }
  });
});
