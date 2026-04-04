import { describe, it, expect } from 'vitest';

import { findMinDistance } from './LidarPanel.helpers';

describe('findMinDistance', () => {
  it('returns the minimum distance from a points array', () => {
    const points = [
      { angle: 0, distance: 5.0 },
      { angle: 1, distance: 2.3 },
      { angle: 2, distance: 8.1 },
    ];
    expect(findMinDistance(points)).toBe(2.3);
  });

  it('returns Infinity for an empty array', () => {
    expect(findMinDistance([])).toBe(Infinity);
  });

  it('handles a single point', () => {
    const points = [{ angle: 0, distance: 4.2 }];
    expect(findMinDistance(points)).toBe(4.2);
  });

  it('handles large arrays without stack overflow', () => {
    const points = Array.from({ length: 10_000 }, (_, i) => ({
      angle: i * 0.001,
      distance: 100 - (i % 100),
    }));
    expect(findMinDistance(points)).toBe(1);
  });

  it('handles very large arrays (beyond call stack limit) without stack overflow', () => {
    const size = 500_000;
    const points = Array.from({ length: size }, (_, i) => ({
      angle: i * 0.001,
      distance: i === size - 1 ? 0.5 : 10.0,
    }));
    expect(findMinDistance(points)).toBe(0.5);
  });
});
