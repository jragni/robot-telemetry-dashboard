import { describe, expect, it } from 'vitest';

import { formatDegrees } from '../formatDegrees';

describe('formatDegrees', () => {
  it('formats 0 degrees', () => {
    expect(formatDegrees(0)).toBe('0');
  });

  it('formats 90 degrees', () => {
    expect(formatDegrees(90)).toBe('90');
  });

  it('formats 180 degrees', () => {
    expect(formatDegrees(180)).toBe('180');
  });

  it('formats negative angles', () => {
    expect(formatDegrees(-45)).toBe('-45');
    expect(formatDegrees(-180)).toBe('-180');
  });

  it('formats large angles', () => {
    expect(formatDegrees(720)).toBe('720');
    expect(formatDegrees(3600)).toBe('3600');
  });

  it('rounds to one decimal place', () => {
    expect(formatDegrees(45.67)).toBe('45.7');
    expect(formatDegrees(90.123)).toBe('90.1');
    expect(formatDegrees(0.04)).toBe('0');
    expect(formatDegrees(0.05)).toBe('0.1');
  });

  it('handles negative decimals', () => {
    expect(formatDegrees(-12.34)).toBe('-12.3');
    expect(formatDegrees(-0.09)).toBe('-0.1');
  });
});
