import { describe, it, expect, vi } from 'vitest';

import { clampCompassWidth } from '../helpers';

describe('clampCompassWidth', () => {
  it('returns min when viewport is small', () => {
    vi.stubGlobal('innerWidth', 400);
    expect(clampCompassWidth()).toBe(200);
    vi.unstubAllGlobals();
  });

  it('returns max when viewport is large', () => {
    vi.stubGlobal('innerWidth', 2000);
    expect(clampCompassWidth()).toBe(320);
    vi.unstubAllGlobals();
  });

  it('returns derived value within range', () => {
    vi.stubGlobal('innerWidth', 1000);
    const result = clampCompassWidth();
    expect(result).toBe(250);
    expect(result).toBeGreaterThanOrEqual(200);
    expect(result).toBeLessThanOrEqual(320);
    vi.unstubAllGlobals();
  });
});
