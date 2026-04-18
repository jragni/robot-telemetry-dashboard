import { describe, expect, it } from 'vitest';

import { normalizeCborMessage } from '../normalizeCborMessage';

describe('normalizeCborMessage', () => {
  describe('pass-through for non-CBOR values', () => {
    it('passes through null', () => {
      expect(normalizeCborMessage(null)).toBeNull();
    });

    it('passes through undefined', () => {
      expect(normalizeCborMessage(undefined)).toBeUndefined();
    });

    it('passes through strings', () => {
      expect(normalizeCborMessage('hello')).toBe('hello');
    });

    it('passes through booleans', () => {
      expect(normalizeCborMessage(true)).toBe(true);
    });

    it('passes through finite numbers', () => {
      expect(normalizeCborMessage(42)).toBe(42);
      expect(normalizeCborMessage(3.14)).toBe(3.14);
      expect(normalizeCborMessage(0)).toBe(0);
      expect(normalizeCborMessage(-1)).toBe(-1);
    });
  });

  describe('NaN coercion', () => {
    it('converts NaN to null', () => {
      expect(normalizeCborMessage(NaN)).toBeNull();
    });

    it('preserves Infinity (not NaN)', () => {
      expect(normalizeCborMessage(Infinity)).toBe(Infinity);
    });
  });

  describe('TypedArray conversion', () => {
    it('converts Float32Array to plain array', () => {
      const typed = new Float32Array([1.0, 2.0, 3.0]);
      const result = normalizeCborMessage(typed);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([1.0, 2.0, 3.0]);
    });

    it('converts Float64Array to plain array', () => {
      const typed = new Float64Array([1.5, 2.5]);
      const result = normalizeCborMessage(typed);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([1.5, 2.5]);
    });

    it('converts empty Float32Array to empty array', () => {
      expect(normalizeCborMessage(new Float32Array([]))).toEqual([]);
    });

    it('converts NaN in Float32Array to null', () => {
      const typed = new Float32Array([1.0, NaN, 3.0]);
      const result = normalizeCborMessage(typed) as (number | null)[];
      expect(result).toEqual([1.0, null, 3.0]);
    });

    it('converts Uint8Array to plain array', () => {
      const typed = new Uint8Array([10, 20, 30]);
      const result = normalizeCborMessage(typed);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([10, 20, 30]);
    });
  });

  describe('plain array handling', () => {
    it('passes through plain arrays', () => {
      expect(normalizeCborMessage([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('converts NaN in plain arrays to null', () => {
      expect(normalizeCborMessage([1, NaN, 3])).toEqual([1, null, 3]);
    });

    it('recurses into nested arrays', () => {
      expect(
        normalizeCborMessage([
          [1, NaN],
          [NaN, 2],
        ]),
      ).toEqual([
        [1, null],
        [null, 2],
      ]);
    });
  });

  describe('object recursion', () => {
    it('recurses into plain objects', () => {
      const input = { x: 1, y: NaN, z: 3 };
      expect(normalizeCborMessage(input)).toEqual({ x: 1, y: null, z: 3 });
    });

    it('converts TypedArray fields in objects', () => {
      const input = {
        ranges: new Float32Array([1.0, 2.0, NaN]),
        angle_min: -3.14,
      };
      const result = normalizeCborMessage(input) as Record<string, unknown>;
      expect(Array.isArray(result.ranges)).toBe(true);
      expect(result.ranges).toEqual([1.0, 2.0, null]);
      expect(result.angle_min).toBe(-3.14);
    });

    it('handles nested objects with TypedArrays', () => {
      const input = {
        orientation: { x: 0, y: 0, z: 0, w: 1 },
        orientation_covariance: new Float64Array([0, 0, 0, 0, 0, 0, 0, 0, 0]),
      };
      const result = normalizeCborMessage(input) as Record<string, unknown>;
      expect(result.orientation).toEqual({ x: 0, y: 0, z: 0, w: 1 });
      expect(Array.isArray(result.orientation_covariance)).toBe(true);
      expect(result.orientation_covariance).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    });

    it('handles a realistic IMU message', () => {
      const imuMsg = {
        header: { stamp: { sec: 123, nanosec: 456 }, frame_id: 'imu_link' },
        orientation: { x: 0.1, y: 0.2, z: 0.3, w: 0.9 },
        orientation_covariance: new Float64Array(9).fill(0),
        angular_velocity: { x: 0.01, y: 0, z: 0 },
        angular_velocity_covariance: new Float64Array(9).fill(0),
        linear_acceleration: { x: 0, y: 0, z: 9.81 },
        linear_acceleration_covariance: new Float64Array(9).fill(0),
      };
      const result = normalizeCborMessage(imuMsg) as Record<string, unknown>;
      expect(result.orientation).toEqual({ x: 0.1, y: 0.2, z: 0.3, w: 0.9 });
      expect(Array.isArray(result.orientation_covariance)).toBe(true);
      expect((result.orientation_covariance as number[]).length).toBe(9);
    });

    it('handles a realistic LaserScan message', () => {
      const scanMsg = {
        angle_min: -3.14,
        angle_max: 3.14,
        angle_increment: 0.01,
        range_min: 0.12,
        range_max: 12.0,
        ranges: new Float32Array([1.0, 2.0, NaN, 4.0]),
        intensities: new Float32Array([100, 100, 0, 100]),
      };
      const result = normalizeCborMessage(scanMsg) as Record<string, unknown>;
      expect(result.ranges).toEqual([1.0, 2.0, null, 4.0]);
      expect(result.intensities).toEqual([100, 100, 0, 100]);
      expect(result.angle_min).toBe(-3.14);
    });
  });
});
