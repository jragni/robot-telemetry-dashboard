import { describe, expect, it } from 'vitest';

import { formatUptime } from './formatUptime';

describe('formatUptime', () => {
  it('returns em dash for null input', () => {
    expect(formatUptime(null)).toBe('—');
  });

  it('formats 0 seconds', () => {
    expect(formatUptime(0)).toBe('00:00:00');
  });

  it('formats seconds only', () => {
    expect(formatUptime(1)).toBe('00:00:01');
    expect(formatUptime(59)).toBe('00:00:59');
  });

  it('formats minutes and seconds', () => {
    expect(formatUptime(60)).toBe('00:01:00');
    expect(formatUptime(90)).toBe('00:01:30');
    expect(formatUptime(3599)).toBe('00:59:59');
  });

  it('formats hours and minutes', () => {
    expect(formatUptime(3600)).toBe('01:00:00');
    expect(formatUptime(3661)).toBe('01:01:01');
    expect(formatUptime(7200)).toBe('02:00:00');
  });

  it('formats large values', () => {
    expect(formatUptime(86400)).toBe('24:00:00');
    expect(formatUptime(360000)).toBe('100:00:00');
  });

  it('floors fractional seconds', () => {
    expect(formatUptime(1.9)).toBe('00:00:01');
    expect(formatUptime(61.7)).toBe('00:01:01');
  });
});
