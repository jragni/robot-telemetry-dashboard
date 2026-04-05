import { describe, expect, it } from 'vitest';
import { laserScanMessageSchema } from '../useLidarSubscription';

describe('laserScanMessageSchema', () => {
  it('parses a valid LaserScan message', () => {
    const msg = {
      angle_min: -1.57,
      angle_increment: 0.01,
      range_min: 0.1,
      range_max: 30,
      ranges: [1.0, 2.0, 3.0],
      intensities: [100, 200, 300],
    };
    const result = laserScanMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ranges).toHaveLength(3);
      expect(result.data.intensities).toHaveLength(3);
    }
  });

  it('parses a message without intensities (defaults to empty array)', () => {
    const msg = {
      angle_min: -1.57,
      angle_increment: 0.01,
      range_min: 0.1,
      range_max: 30,
      ranges: [1.0, 2.0],
    };
    const result = laserScanMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.intensities).toEqual([]);
    }
  });

  it('rejects a message missing ranges', () => {
    const msg = {
      angle_min: -1.57,
      angle_increment: 0.01,
      range_min: 0.1,
      range_max: 30,
    };
    const result = laserScanMessageSchema.safeParse(msg);
    expect(result.success).toBe(false);
  });

  it('rejects an empty object', () => {
    const result = laserScanMessageSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric range values', () => {
    const msg = {
      angle_min: -1.57,
      angle_increment: 0.01,
      range_min: 0.1,
      range_max: 30,
      ranges: ['bad'],
    };
    const result = laserScanMessageSchema.safeParse(msg);
    expect(result.success).toBe(false);
  });

  it('rejects null', () => {
    const result = laserScanMessageSchema.safeParse(null);
    expect(result.success).toBe(false);
  });

  it('accepts null values in intensities array (real hardware sends these)', () => {
    const msg = {
      angle_min: -1.57,
      angle_increment: 0.01,
      range_min: 0.1,
      range_max: 30,
      ranges: [1.0, 2.0],
      intensities: [100, null, 300],
    };
    const result = laserScanMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.intensities).toEqual([100, null, 300]);
    }
  });

  it('accepts null values in ranges array (rosbridge serializes NaN/Infinity as null)', () => {
    const msg = {
      angle_min: -1.57,
      angle_increment: 0.01,
      range_min: 0.1,
      range_max: 30,
      ranges: [1.0, null, 3.0],
    };
    const result = laserScanMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ranges).toEqual([1.0, null, 3.0]);
    }
  });
});
