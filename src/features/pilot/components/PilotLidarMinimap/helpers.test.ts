import { describe, it, expect, vi } from 'vitest';

import { clampSize } from './helpers';

describe('clampSize', () => {
  it('returns min when viewport is small', () => {
    vi.stubGlobal('innerHeight', 400);
    expect(clampSize()).toBe(120);
    vi.unstubAllGlobals();
  });

  it('returns max when viewport is large', () => {
    vi.stubGlobal('innerHeight', 2000);
    expect(clampSize()).toBe(220);
    vi.unstubAllGlobals();
  });

  it('respects ceiling override', () => {
    vi.stubGlobal('innerHeight', 2000);
    expect(clampSize(100)).toBe(100);
    vi.unstubAllGlobals();
  });

  it('returns derived value within range', () => {
    vi.stubGlobal('innerHeight', 800);
    const result = clampSize();
    expect(result).toBe(160);
    expect(result).toBeGreaterThanOrEqual(120);
    expect(result).toBeLessThanOrEqual(220);
    vi.unstubAllGlobals();
  });
});
