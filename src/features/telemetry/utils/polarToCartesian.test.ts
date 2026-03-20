import { describe, expect, it } from 'vitest';

import { polarToCartesian } from './polarToCartesian';

import type { LaserScanMessage } from '@/features/telemetry/types/ros-sensor-messages.types';

const makeScan = (
  overrides: Partial<LaserScanMessage> = {}
): LaserScanMessage => ({
  angle_min: 0,
  angle_max: Math.PI,
  angle_increment: Math.PI / 2, // 3 readings: 0°, 90°, 180°
  time_increment: 0,
  scan_time: 0.1,
  range_min: 0.1,
  range_max: 10.0,
  ranges: [1.0, 1.0, 1.0],
  intensities: [],
  ...overrides,
});

describe('polarToCartesian', () => {
  it('returns a Float32Array', () => {
    const result = polarToCartesian(makeScan(), 10);
    expect(result).toBeInstanceOf(Float32Array);
  });

  it('converts known angle and range to correct x/y', () => {
    // Single point at angle 0°, range 1.0 → x=1, y=0
    const scan = makeScan({
      angle_min: 0,
      angle_max: 0,
      angle_increment: 1,
      ranges: [1.0],
    });
    const result = polarToCartesian(scan, 10);
    expect(result).toHaveLength(2); // [x, y]
    expect(result[0]).toBeCloseTo(1.0, 5); // x = r * cos(0) = 1
    expect(result[1]).toBeCloseTo(0.0, 5); // y = r * sin(0) = 0
  });

  it('converts 90° angle correctly', () => {
    const scan = makeScan({
      angle_min: Math.PI / 2,
      angle_max: Math.PI / 2,
      angle_increment: 1,
      ranges: [2.0],
    });
    const result = polarToCartesian(scan, 10);
    expect(result[0]).toBeCloseTo(0.0, 5); // x = r * cos(90°) ≈ 0
    expect(result[1]).toBeCloseTo(2.0, 5); // y = r * sin(90°) = 2
  });

  it('filters out Infinity ranges', () => {
    const scan = makeScan({
      angle_min: 0,
      angle_max: Math.PI,
      angle_increment: Math.PI / 2,
      ranges: [1.0, Infinity, 1.0],
    });
    const result = polarToCartesian(scan, 10);
    // Only 2 valid points = 4 values
    expect(result).toHaveLength(4);
  });

  it('filters out NaN ranges', () => {
    const scan = makeScan({
      angle_min: 0,
      angle_max: Math.PI,
      angle_increment: Math.PI / 2,
      ranges: [1.0, NaN, 1.0],
    });
    const result = polarToCartesian(scan, 10);
    expect(result).toHaveLength(4);
  });

  it('filters out ranges exceeding maxRange', () => {
    const scan = makeScan({
      angle_min: 0,
      angle_max: Math.PI,
      angle_increment: Math.PI / 2,
      ranges: [1.0, 15.0, 1.0], // 15 > maxRange 10
    });
    const result = polarToCartesian(scan, 10);
    expect(result).toHaveLength(4);
  });

  it('filters out ranges below range_min', () => {
    const scan = makeScan({
      range_min: 0.5,
      ranges: [0.1, 1.0, 0.3], // first and third below range_min
    });
    const result = polarToCartesian(scan, 10);
    expect(result).toHaveLength(2); // only middle point valid
  });

  it('returns empty Float32Array for empty ranges array', () => {
    const scan = makeScan({ ranges: [] });
    const result = polarToCartesian(scan, 10);
    expect(result).toHaveLength(0);
  });

  it('returns empty Float32Array when all ranges are filtered', () => {
    const scan = makeScan({ ranges: [Infinity, NaN, 999] });
    const result = polarToCartesian(scan, 10);
    expect(result).toHaveLength(0);
  });

  it('correctly handles all 3 points in multi-point scan', () => {
    // angle_min=0, increment=π/2: angles = [0, π/2, π]
    const scan = makeScan({
      angle_min: 0,
      angle_increment: Math.PI / 2,
      ranges: [1.0, 1.0, 1.0],
    });
    const result = polarToCartesian(scan, 10);
    expect(result).toHaveLength(6); // 3 points × 2 coords
    // Point 0: angle=0, r=1 → x=1, y=0
    expect(result[0]).toBeCloseTo(1.0, 5);
    expect(result[1]).toBeCloseTo(0.0, 5);
    // Point 1: angle=π/2, r=1 → x≈0, y=1
    expect(result[2]).toBeCloseTo(0.0, 4);
    expect(result[3]).toBeCloseTo(1.0, 5);
    // Point 2: angle=π, r=1 → x=-1, y≈0
    expect(result[4]).toBeCloseTo(-1.0, 5);
    expect(result[5]).toBeCloseTo(0.0, 4);
  });

  it('handles degenerate scan with angle_increment=0 (single dot)', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
      // suppress console.warn in test
    });
    const scan = makeScan({
      angle_increment: 0,
      ranges: [1.0],
    });
    const result = polarToCartesian(scan, 10);
    // Should return single point, not throw
    expect(result).toHaveLength(2);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('handles 1440-point scan without throwing (performance path)', () => {
    const ranges = new Array(1440).fill(1.0);
    const scan = makeScan({
      angle_min: -Math.PI,
      angle_max: Math.PI,
      angle_increment: (2 * Math.PI) / 1440,
      ranges,
    });
    const result = polarToCartesian(scan, 10);
    expect(result).toHaveLength(1440 * 2);
  });
});
