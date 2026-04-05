import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { formatLastSeen } from './formatLastSeen';

describe('formatLastSeen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-03T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns em dash for null input', () => {
    expect(formatLastSeen(null)).toBe('—');
  });

  it('returns "just now" for timestamps less than 5 seconds ago', () => {
    const now = Date.now();
    expect(formatLastSeen(now)).toBe('just now');
    expect(formatLastSeen(now - 4999)).toBe('just now');
  });

  it('returns seconds ago for timestamps between 5s and 60s', () => {
    const now = Date.now();
    expect(formatLastSeen(now - 5000)).toBe('5s ago');
    expect(formatLastSeen(now - 30000)).toBe('30s ago');
    expect(formatLastSeen(now - 59999)).toBe('59s ago');
  });

  it('returns minutes ago for timestamps between 1m and 60m', () => {
    const now = Date.now();
    expect(formatLastSeen(now - 60000)).toBe('1m ago');
    expect(formatLastSeen(now - 300000)).toBe('5m ago');
    expect(formatLastSeen(now - 3599999)).toBe('59m ago');
  });

  it('returns hours ago for timestamps over 60 minutes', () => {
    const now = Date.now();
    expect(formatLastSeen(now - 3600000)).toBe('1h ago');
    expect(formatLastSeen(now - 7200000)).toBe('2h ago');
    expect(formatLastSeen(now - 86400000)).toBe('24h ago');
  });

  it('returns hours for multi-day durations', () => {
    const now = Date.now();
    expect(formatLastSeen(now - 172800000)).toBe('48h ago');
  });
});
