import { describe, expect, it } from 'vitest';

import { normalizeRosbridgeUrl } from './helpers';

describe('normalizeRosbridgeUrl', () => {
  it('passes through ws:// URLs unchanged', () => {
    expect(normalizeRosbridgeUrl('ws://localhost:9090')).toBe('ws://localhost:9090');
  });

  it('passes through wss:// URLs unchanged', () => {
    expect(normalizeRosbridgeUrl('wss://robot.example.com:9090')).toBe(
      'wss://robot.example.com:9090',
    );
  });

  it('converts https:// to wss://', () => {
    expect(normalizeRosbridgeUrl('https://robot.example.com:9090')).toBe(
      'wss://robot.example.com:9090',
    );
  });

  it('converts http:// to ws://', () => {
    expect(normalizeRosbridgeUrl('http://192.168.1.10:9090')).toBe('ws://192.168.1.10:9090');
  });

  it('prepends wss:// to bare hostnames', () => {
    expect(normalizeRosbridgeUrl('robot.example.com:9090')).toBe('wss://robot.example.com:9090');
  });

  it('returns empty string for empty input', () => {
    expect(normalizeRosbridgeUrl('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(normalizeRosbridgeUrl('   ')).toBe('');
  });

  it('returns empty string for invalid input that cannot be parsed as URL', () => {
    expect(normalizeRosbridgeUrl('://')).toBe('');
  });

  it('trims leading and trailing whitespace', () => {
    expect(normalizeRosbridgeUrl('  ws://localhost:9090  ')).toBe('ws://localhost:9090');
  });

  it('preserves paths in URLs', () => {
    expect(normalizeRosbridgeUrl('ws://localhost:9090/rosbridge')).toBe(
      'ws://localhost:9090/rosbridge',
    );
  });

  it('handles bare IP addresses', () => {
    expect(normalizeRosbridgeUrl('192.168.1.10:9090')).toBe('wss://192.168.1.10:9090');
  });
});
