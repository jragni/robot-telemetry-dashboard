import { describe, expect, it } from 'vitest';

import { normalizeHeading } from './normalizeHeading';

describe('normalizeHeading', () => {
  it('returns 0 for 0 degrees', () => {
    expect(normalizeHeading(0)).toBe(0);
  });

  it('passes through values in 0-359 range', () => {
    expect(normalizeHeading(90)).toBe(90);
    expect(normalizeHeading(180)).toBe(180);
    expect(normalizeHeading(359)).toBe(359);
  });

  it('wraps exactly 360 to 0', () => {
    expect(normalizeHeading(360)).toBe(0);
  });

  it('wraps values greater than 360', () => {
    expect(normalizeHeading(361)).toBe(1);
    expect(normalizeHeading(450)).toBe(90);
    expect(normalizeHeading(720)).toBe(0);
    expect(normalizeHeading(725)).toBe(5);
  });

  it('normalizes negative values', () => {
    expect(normalizeHeading(-1)).toBe(359);
    expect(normalizeHeading(-90)).toBe(270);
    expect(normalizeHeading(-180)).toBe(180);
    expect(normalizeHeading(-360)).toBe(0);
    expect(normalizeHeading(-361)).toBe(359);
  });

  it('handles large negative values', () => {
    expect(normalizeHeading(-720)).toBe(0);
    expect(normalizeHeading(-725)).toBe(355);
  });
});
