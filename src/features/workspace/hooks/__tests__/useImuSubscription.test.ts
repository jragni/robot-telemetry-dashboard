import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImuSubscription } from '../useImuSubscription';

// Capture the onMessage callback passed to useRosSubscriber
let capturedOnMessage: ((msg: unknown) => void) | null = null;

vi.mock('@/hooks/useRosSubscriber', () => ({
  useRosSubscriber: (
    _ros: unknown,
    _topic: string,
    _msgType: string,
    onMessage: (msg: unknown) => void,
  ) => {
    capturedOnMessage = onMessage;
  },
}));

vi.mock('@/utils/rafThrottle', () => ({
  rafThrottle: (fn: (...args: never[]) => void) => fn,
}));

function makeImuMessage(q: { x: number; y: number; z: number; w: number }) {
  return {
    header: { seq: 0, stamp: { secs: 0, nsecs: 0 }, frame_id: 'imu_link' },
    orientation: q,
    orientation_covariance: Array.from({ length: 9 }, () => 0),
    angular_velocity: { x: 0.1, y: 0.2, z: 0.3 },
    angular_velocity_covariance: Array.from({ length: 9 }, () => 0),
    linear_acceleration: { x: 0, y: 0, z: 9.81 },
    linear_acceleration_covariance: Array.from({ length: 9 }, () => 0),
  };
}

describe('useImuSubscription', () => {
  beforeEach(() => {
    capturedOnMessage = null;
  });

  it('returns zero defaults when no messages received', () => {
    const { result } = renderHook(() =>
      useImuSubscription(undefined, '/imu/data'),
    );

    expect(result.current.roll).toBe(0);
    expect(result.current.pitch).toBe(0);
    expect(result.current.yaw).toBe(0);
    expect(result.current.angularVelocity).toBeUndefined();
    expect(result.current.linearAcceleration).toBeUndefined();
  });

  it('converts identity quaternion to zero Euler angles', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useImuSubscription(fakeRos, '/imu/data'),
    );

    const identityMsg = makeImuMessage({ x: 0, y: 0, z: 0, w: 1 });

    act(() => {
      capturedOnMessage?.(identityMsg);
    });

    expect(result.current.roll).toBeCloseTo(0, 5);
    expect(result.current.pitch).toBeCloseTo(0, 5);
    expect(result.current.yaw).toBeCloseTo(0, 5);
  });

  it('converts a 90-degree yaw quaternion correctly', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useImuSubscription(fakeRos, '/imu/data'),
    );

    // 90-degree rotation about Z axis: w=cos(45deg), z=sin(45deg)
    const halfSqrt2 = Math.SQRT2 / 2;
    const msg = makeImuMessage({ x: 0, y: 0, z: halfSqrt2, w: halfSqrt2 });

    act(() => {
      capturedOnMessage?.(msg);
    });

    expect(result.current.roll).toBeCloseTo(0, 3);
    expect(result.current.pitch).toBeCloseTo(0, 3);
    expect(result.current.yaw).toBeCloseTo(90, 3);
  });

  it('passes through angular velocity and linear acceleration', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useImuSubscription(fakeRos, '/imu/data'),
    );

    const msg = makeImuMessage({ x: 0, y: 0, z: 0, w: 1 });

    act(() => {
      capturedOnMessage?.(msg);
    });

    expect(result.current.angularVelocity).toEqual({ x: 0.1, y: 0.2, z: 0.3 });
    expect(result.current.linearAcceleration).toEqual({ x: 0, y: 0, z: 9.81 });
  });

  it('handles pitch near gimbal lock (sinp >= 1)', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useImuSubscription(fakeRos, '/imu/data'),
    );

    // 90-degree pitch: rotation about Y axis
    const halfSqrt2 = Math.SQRT2 / 2;
    const msg = makeImuMessage({ x: 0, y: halfSqrt2, z: 0, w: halfSqrt2 });

    act(() => {
      capturedOnMessage?.(msg);
    });

    expect(result.current.pitch).toBeCloseTo(90, 3);
  });
});
