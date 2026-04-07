import { describe, expect, it } from 'vitest';

import { withAlpha } from '../withAlpha';

describe('withAlpha', () => {
  it('adds alpha to oklch color string', () => {
    expect(withAlpha('oklch(0.5 0.2 260)', 0.5)).toBe('oklch(0.5 0.2 260 / 0.5)');
  });

  it('handles alpha of 0', () => {
    expect(withAlpha('oklch(0.5 0.2 260)', 0)).toBe('oklch(0.5 0.2 260 / 0)');
  });

  it('handles alpha of 1', () => {
    expect(withAlpha('oklch(0.5 0.2 260)', 1)).toBe('oklch(0.5 0.2 260 / 1)');
  });

  it('trims whitespace from color string', () => {
    expect(withAlpha('  oklch(0.5 0.2 260)  ', 0.8)).toBe('oklch(0.5 0.2 260 / 0.8)');
  });

  it('uses color-mix fallback for non-oklch strings', () => {
    expect(withAlpha('red', 0.5)).toBe('color-mix(in oklch, red 50%, transparent)');
  });

  it('rounds color-mix percentage to nearest integer', () => {
    expect(withAlpha('blue', 0.333)).toBe('color-mix(in oklch, blue 33%, transparent)');
    expect(withAlpha('green', 0.666)).toBe('color-mix(in oklch, green 67%, transparent)');
  });

  it('handles hex color via color-mix fallback', () => {
    expect(withAlpha('#ff0000', 0.75)).toBe('color-mix(in oklch, #ff0000 75%, transparent)');
  });

  it('handles color-mix with alpha 0 and 1', () => {
    expect(withAlpha('red', 0)).toBe('color-mix(in oklch, red 0%, transparent)');
    expect(withAlpha('red', 1)).toBe('color-mix(in oklch, red 100%, transparent)');
  });
});
