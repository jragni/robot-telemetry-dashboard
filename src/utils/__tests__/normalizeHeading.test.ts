import { normalizeHeading } from '@/utils/normalizeHeading';

describe('normalizeHeading', () => {
  it('returns 0 for 0 degrees', () => {
    expect(normalizeHeading(0)).toBe(0);
  });

  it('wraps 360 to 0', () => {
    expect(normalizeHeading(360)).toBe(0);
  });

  it('returns 180 unchanged', () => {
    expect(normalizeHeading(180)).toBe(180);
  });

  it('normalizes negative angles', () => {
    expect(normalizeHeading(-90)).toBe(270);
    expect(normalizeHeading(-1)).toBe(359);
    expect(normalizeHeading(-360)).toBe(0);
  });

  it('normalizes -180 to 180', () => {
    expect(normalizeHeading(-180)).toBe(180);
  });

  it('normalizes angles greater than 360', () => {
    expect(normalizeHeading(450)).toBe(90);
    expect(normalizeHeading(720)).toBe(0);
    expect(normalizeHeading(361)).toBe(1);
  });

  it('handles large negative values', () => {
    expect(normalizeHeading(-720)).toBe(0);
    expect(normalizeHeading(-450)).toBe(270);
  });
});
