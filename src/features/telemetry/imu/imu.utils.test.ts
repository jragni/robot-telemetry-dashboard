import { describe, it, expect } from 'vitest';

import { quaternionToEuler, transformImuMessage } from './imu.utils';

import type { ImuMessage, Quaternion } from '@/types/ros-messages';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a unit quaternion from an axis-angle rotation.
 * axis must be a unit vector.
 */
function axisAngleToQuat(
  ax: number,
  ay: number,
  az: number,
  angleDeg: number
): Quaternion {
  const half = (angleDeg * Math.PI) / 180 / 2;
  const s = Math.sin(half);
  return { x: ax * s, y: ay * s, z: az * s, w: Math.cos(half) };
}

function makeImuMessage(overrides: Partial<ImuMessage> = {}): ImuMessage {
  return {
    header: { stamp: { sec: 100, nsec: 500_000_000 }, frame_id: 'imu_link' },
    orientation: { x: 0, y: 0, z: 0, w: 1 },
    angular_velocity: { x: 0, y: 0, z: 0 },
    linear_acceleration: { x: 0, y: 0, z: 0 },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// quaternionToEuler
// ---------------------------------------------------------------------------

describe('quaternionToEuler', () => {
  it('identity quaternion yields roll=0, pitch=0, yaw=0', () => {
    const result = quaternionToEuler({ x: 0, y: 0, z: 0, w: 1 });

    expect(result.roll).toBeCloseTo(0, 5);
    expect(result.pitch).toBeCloseTo(0, 5);
    expect(result.yaw).toBeCloseTo(0, 5);
  });

  it('90° rotation about Z axis yields yaw≈90, roll≈0, pitch≈0', () => {
    const q = axisAngleToQuat(0, 0, 1, 90);
    const result = quaternionToEuler(q);

    expect(result.yaw).toBeCloseTo(90, 3);
    expect(result.roll).toBeCloseTo(0, 3);
    expect(result.pitch).toBeCloseTo(0, 3);
  });

  it('45° rotation about X axis yields roll≈45, pitch≈0, yaw≈0', () => {
    const q = axisAngleToQuat(1, 0, 0, 45);
    const result = quaternionToEuler(q);

    expect(result.roll).toBeCloseTo(45, 3);
    expect(result.pitch).toBeCloseTo(0, 3);
    expect(result.yaw).toBeCloseTo(0, 3);
  });

  it('90° rotation about X axis yields roll≈90', () => {
    const q = axisAngleToQuat(1, 0, 0, 90);
    const result = quaternionToEuler(q);

    expect(result.roll).toBeCloseTo(90, 3);
  });

  it('returns degrees, not radians', () => {
    const q = axisAngleToQuat(0, 0, 1, 45);
    const result = quaternionToEuler(q);

    // If it were returning radians the value would be ~0.785, not ~45
    expect(Math.abs(result.yaw)).toBeGreaterThan(10);
    expect(result.yaw).toBeCloseTo(45, 3);
  });
});

// ---------------------------------------------------------------------------
// transformImuMessage
// ---------------------------------------------------------------------------

describe('transformImuMessage', () => {
  it('maps orientation via quaternionToEuler — identity produces 0 angles', () => {
    const msg = makeImuMessage();
    const result = transformImuMessage(msg);

    expect(result.roll).toBeCloseTo(0, 5);
    expect(result.pitch).toBeCloseTo(0, 5);
    expect(result.yaw).toBeCloseTo(0, 5);
  });

  it('maps linear_acceleration fields to accelX/Y/Z', () => {
    const msg = makeImuMessage({
      linear_acceleration: { x: 1.5, y: -2.0, z: 9.81 },
    });
    const result = transformImuMessage(msg);

    expect(result.accelX).toBe(1.5);
    expect(result.accelY).toBe(-2.0);
    expect(result.accelZ).toBe(9.81);
  });

  it('computes accelMagnitude of (0, 0, 9.81) ≈ 9.81', () => {
    const msg = makeImuMessage({
      linear_acceleration: { x: 0, y: 0, z: 9.81 },
    });
    const result = transformImuMessage(msg);

    expect(result.accelMagnitude).toBeCloseTo(9.81, 4);
  });

  it('computes accelMagnitude from known 3-4-5 triple: (3, 4, 0) → 5', () => {
    const msg = makeImuMessage({
      linear_acceleration: { x: 3, y: 4, z: 0 },
    });
    const result = transformImuMessage(msg);

    expect(result.accelMagnitude).toBeCloseTo(5, 5);
  });

  it('maps angular_velocity fields to angularVelX/Y/Z', () => {
    const msg = makeImuMessage({
      angular_velocity: { x: 0.1, y: 0.2, z: 0.3 },
    });
    const result = transformImuMessage(msg);

    expect(result.angularVelX).toBe(0.1);
    expect(result.angularVelY).toBe(0.2);
    expect(result.angularVelZ).toBe(0.3);
  });

  it('computes angularVelMagnitude correctly', () => {
    // sqrt(0 + 0 + 1) = 1
    const msg = makeImuMessage({
      angular_velocity: { x: 0, y: 0, z: 1 },
    });
    const result = transformImuMessage(msg);

    expect(result.angularVelMagnitude).toBeCloseTo(1, 5);
  });

  it('maps header.stamp to timestamp as sec + nsec/1e9', () => {
    const msg = makeImuMessage({
      header: { stamp: { sec: 100, nsec: 500_000_000 }, frame_id: 'imu_link' },
    });
    const result = transformImuMessage(msg);

    // 100 + 0.5 = 100.5
    expect(result.timestamp).toBeCloseTo(100.5, 6);
  });

  it('maps header.stamp with nsec=0 correctly', () => {
    const msg = makeImuMessage({
      header: { stamp: { sec: 42, nsec: 0 }, frame_id: 'imu_link' },
    });
    const result = transformImuMessage(msg);

    expect(result.timestamp).toBeCloseTo(42, 6);
  });

  it('preserves non-identity orientation through the transform pipeline', () => {
    const half = Math.PI / 4; // 45° yaw → z-rotation
    const q: Quaternion = {
      x: 0,
      y: 0,
      z: Math.sin(half / 2),
      w: Math.cos(half / 2),
    };
    const msg = makeImuMessage({ orientation: q });
    const result = transformImuMessage(msg);

    // yaw should be non-zero
    expect(Math.abs(result.yaw)).toBeGreaterThan(0);
  });
});
