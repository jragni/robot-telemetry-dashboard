import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImuSubscription } from './useImuSubscription';

let capturedOnMessage: ((msg: unknown) => void) | null = null;

vi.mock('@/hooks/useRosSubscriber', () => ({
  useRosSubscriber: (
    _ros: unknown,
    _topic: string,
    _type: string,
    onMessage: (msg: unknown) => void,
  ) => {
    capturedOnMessage = onMessage;
  },
}));

vi.mock('@/utils/rafThrottle', () => ({
  rafThrottle: (fn: (...args: never[]) => void) => {
    const throttled = (...args: Parameters<typeof fn>) => {
      (fn as (...a: unknown[]) => void)(...args);
    };
    throttled.cancel = vi.fn();
    return throttled;
  },
}));

// Identity quaternion (no rotation): roll=0, pitch=0, yaw=0
const IDENTITY_QUATERNION = { w: 1, x: 0, y: 0, z: 0 };

// 90-degree rotation around X axis (roll = 90)
const ROLL_90_QUATERNION = {
  w: Math.cos(Math.PI / 4),
  x: Math.sin(Math.PI / 4),
  y: 0,
  z: 0,
};

// 90-degree rotation around Y axis (pitch = 90)
const PITCH_90_QUATERNION = {
  w: Math.cos(Math.PI / 4),
  x: 0,
  y: Math.sin(Math.PI / 4),
  z: 0,
};

// 90-degree rotation around Z axis (yaw = 90)
const YAW_90_QUATERNION = {
  w: Math.cos(Math.PI / 4),
  x: 0,
  y: 0,
  z: Math.sin(Math.PI / 4),
};

describe('useImuSubscription', () => {
  beforeEach(() => {
    capturedOnMessage = null;
  });

  it('returns zero angles as initial state', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useImuSubscription(fakeRos, '/imu'),
    );

    expect(result.current).toEqual({
      angularVelocity: undefined,
      linearAcceleration: undefined,
      pitch: 0,
      roll: 0,
      yaw: 0,
    });
  });

  it('updates state with valid IMU message', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useImuSubscription(fakeRos, '/imu'),
    );

    act(() => {
      capturedOnMessage?.({
        angular_velocity: { x: 0.1, y: 0.2, z: 0.3 },
        linear_acceleration: { x: 0, y: 0, z: 9.81 },
        orientation: IDENTITY_QUATERNION,
      });
    });

    expect(result.current.roll).toBeCloseTo(0);
    expect(result.current.pitch).toBeCloseTo(0);
    expect(result.current.yaw).toBeCloseTo(0);
    expect(result.current.angularVelocity).toEqual({ x: 0.1, y: 0.2, z: 0.3 });
    expect(result.current.linearAcceleration).toEqual({ x: 0, y: 0, z: 9.81 });
  });

  it('converts quaternion to euler angles for 90-degree roll', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useImuSubscription(fakeRos, '/imu'),
    );

    act(() => {
      capturedOnMessage?.({
        orientation: ROLL_90_QUATERNION,
      });
    });

    expect(result.current.roll).toBeCloseTo(90, 0);
    expect(result.current.pitch).toBeCloseTo(0, 0);
    expect(result.current.yaw).toBeCloseTo(0, 0);
  });

  it('converts quaternion to euler angles for 90-degree pitch', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useImuSubscription(fakeRos, '/imu'),
    );

    act(() => {
      capturedOnMessage?.({
        orientation: PITCH_90_QUATERNION,
      });
    });

    expect(result.current.pitch).toBeCloseTo(90, 0);
  });

  it('converts quaternion to euler angles for 90-degree yaw', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useImuSubscription(fakeRos, '/imu'),
    );

    act(() => {
      capturedOnMessage?.({
        orientation: YAW_90_QUATERNION,
      });
    });

    expect(result.current.yaw).toBeCloseTo(90, 0);
  });

  it('handles optional angular_velocity and linear_acceleration', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useImuSubscription(fakeRos, '/imu'),
    );

    act(() => {
      capturedOnMessage?.({
        orientation: IDENTITY_QUATERNION,
      });
    });

    expect(result.current.angularVelocity).toBeUndefined();
    expect(result.current.linearAcceleration).toBeUndefined();
  });

  it('does not update state with invalid message', () => {
    const fakeRos = {} as never;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() =>
      useImuSubscription(fakeRos, '/imu'),
    );

    act(() => {
      capturedOnMessage?.({ orientation: 'bad' });
    });

    expect(result.current.roll).toBe(0);
    expect(result.current.pitch).toBe(0);
    expect(result.current.yaw).toBe(0);
    warnSpy.mockRestore();
  });

  it('does not update state when message is missing orientation', () => {
    const fakeRos = {} as never;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() =>
      useImuSubscription(fakeRos, '/imu'),
    );

    act(() => {
      capturedOnMessage?.({});
    });

    expect(result.current.roll).toBe(0);
    warnSpy.mockRestore();
  });
});
