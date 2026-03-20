import { describe, expect, it } from 'vitest';

import { quaternionToEuler } from './quaternionToEuler';

describe('quaternionToEuler', () => {
  it('identity quaternion returns zero euler angles', () => {
    const result = quaternionToEuler({ x: 0, y: 0, z: 0, w: 1 });
    expect(result.roll).toBeCloseTo(0, 5);
    expect(result.pitch).toBeCloseTo(0, 5);
    expect(result.yaw).toBeCloseTo(0, 5);
  });

  it('returns values in degrees, not radians', () => {
    // 90° yaw: quaternion (0, 0, sin(45°), cos(45°))
    const sin45 = Math.sin(Math.PI / 4);
    const cos45 = Math.cos(Math.PI / 4);
    const result = quaternionToEuler({ x: 0, y: 0, z: sin45, w: cos45 });
    expect(result.yaw).toBeCloseTo(90, 4);
    expect(result.roll).toBeCloseTo(0, 4);
    expect(result.pitch).toBeCloseTo(0, 4);
  });

  it('90° pitch quaternion returns correct pitch in degrees', () => {
    const sin45 = Math.sin(Math.PI / 4);
    const cos45 = Math.cos(Math.PI / 4);
    const result = quaternionToEuler({ x: 0, y: sin45, z: 0, w: cos45 });
    expect(result.pitch).toBeCloseTo(90, 4);
    expect(result.roll).toBeCloseTo(0, 4);
    expect(result.yaw).toBeCloseTo(0, 4);
  });

  it('90° roll quaternion returns correct roll in degrees', () => {
    const sin45 = Math.sin(Math.PI / 4);
    const cos45 = Math.cos(Math.PI / 4);
    const result = quaternionToEuler({ x: sin45, y: 0, z: 0, w: cos45 });
    expect(result.roll).toBeCloseTo(90, 4);
    expect(result.pitch).toBeCloseTo(0, 4);
    expect(result.yaw).toBeCloseTo(0, 4);
  });

  it('180° yaw (gimbal boundary) returns ±180 degrees', () => {
    // Quaternion for 180° yaw: (0, 0, 1, 0)
    const result = quaternionToEuler({ x: 0, y: 0, z: 1, w: 0 });
    expect(Math.abs(result.yaw)).toBeCloseTo(180, 4);
  });

  it('-90° yaw quaternion returns negative yaw degrees', () => {
    const sin45 = Math.sin(-Math.PI / 4);
    const cos45 = Math.cos(-Math.PI / 4);
    const result = quaternionToEuler({ x: 0, y: 0, z: sin45, w: cos45 });
    expect(result.yaw).toBeCloseTo(-90, 4);
  });

  it('normalizes quaternion if magnitude is not 1 and emits console.warn', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
      // suppress console.warn in test
    });
    // Denormalized version of identity: scale by 2
    const result = quaternionToEuler({ x: 0, y: 0, z: 0, w: 2 });
    expect(result.roll).toBeCloseTo(0, 4);
    expect(result.pitch).toBeCloseTo(0, 4);
    expect(result.yaw).toBeCloseTo(0, 4);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('does not warn for quaternion within normalization tolerance (1e-6)', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
      // suppress console.warn in test
    });
    // Quaternion within tolerance of unit length
    quaternionToEuler({ x: 0, y: 0, z: 0, w: 1.0000000001 });
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('uses ZYX convention (standard ROS convention)', () => {
    // Combined rotation: 45° roll, 30° pitch, 60° yaw
    // Pre-calculated quaternion values for ZYX convention
    const rollRad = (45 * Math.PI) / 180;
    const pitchRad = (30 * Math.PI) / 180;
    const yawRad = (60 * Math.PI) / 180;

    const cy = Math.cos(yawRad / 2);
    const sy = Math.sin(yawRad / 2);
    const cp = Math.cos(pitchRad / 2);
    const sp = Math.sin(pitchRad / 2);
    const cr = Math.cos(rollRad / 2);
    const sr = Math.sin(rollRad / 2);

    const q = {
      w: cr * cp * cy + sr * sp * sy,
      x: sr * cp * cy - cr * sp * sy,
      y: cr * sp * cy + sr * cp * sy,
      z: cr * cp * sy - sr * sp * cy,
    };

    const result = quaternionToEuler(q);
    expect(result.roll).toBeCloseTo(45, 3);
    expect(result.pitch).toBeCloseTo(30, 3);
    expect(result.yaw).toBeCloseTo(60, 3);
  });
});
