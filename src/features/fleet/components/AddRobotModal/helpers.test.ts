import { describe, it, expect, afterEach } from 'vitest';

import { detectMixedContent } from './helpers';

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
