import { describe, it, expect } from 'vitest';

import { COMPASS_CARDINALS, LIDAR_POINT_RADIUS } from './canvas';

describe('shared canvas constants', () => {
  it('COMPASS_CARDINALS has 4 cardinal directions', () => {
    expect(COMPASS_CARDINALS).toHaveLength(4);
  });

  it('COMPASS_CARDINALS covers N/E/S/W at 0/90/180/270 degrees', () => {
    const labels = COMPASS_CARDINALS.map((c) => c.label);
    const degrees = COMPASS_CARDINALS.map((c) => c.deg);
    expect(labels).toEqual(['N', 'E', 'S', 'W']);
    expect(degrees).toEqual([0, 90, 180, 270]);
  });

  it('LIDAR_POINT_RADIUS is a positive number', () => {
    expect(LIDAR_POINT_RADIUS).toBeGreaterThan(0);
    expect(typeof LIDAR_POINT_RADIUS).toBe('number');
  });
});
