import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLidarSubscription } from '../useLidarSubscription';

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

function makeLaserScan(overrides: Partial<{
  ranges: number[];
  intensities: number[];
  angle_min: number;
  angle_increment: number;
  range_min: number;
  range_max: number;
}> = {}) {
  return {
    header: { seq: 0, stamp: { secs: 0, nsecs: 0 }, frame_id: 'laser_link' },
    angle_min: overrides.angle_min ?? 0,
    angle_max: Math.PI,
    angle_increment: overrides.angle_increment ?? (Math.PI / 4),
    time_increment: 0,
    scan_time: 0.1,
    range_min: overrides.range_min ?? 0.1,
    range_max: overrides.range_max ?? 10,
    ranges: overrides.ranges ?? [1, 2, 3],
    intensities: overrides.intensities ?? [100, 200, 300],
  };
}

describe('useLidarSubscription', () => {
  beforeEach(() => {
    capturedOnMessage = null;
  });

  it('returns empty points when no messages received', () => {
    const { result } = renderHook(() =>
      useLidarSubscription(undefined, '/scan'),
    );

    expect(result.current.points).toEqual([]);
    expect(result.current.rangeMax).toBe(15);
  });

  it('parses a valid scan into correct point array', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useLidarSubscription(fakeRos, '/scan'),
    );

    const scan = makeLaserScan({
      ranges: [1, 2, 3],
      intensities: [10, 20, 30],
      angle_min: 0,
      angle_increment: Math.PI / 4,
      range_min: 0.1,
      range_max: 10,
    });

    act(() => {
      capturedOnMessage?.(scan);
    });

    expect(result.current.points).toHaveLength(3);
    expect(result.current.points[0]).toEqual({
      angle: 0,
      distance: 1,
      intensity: 10,
    });
    expect(result.current.points[1]).toEqual({
      angle: Math.PI / 4,
      distance: 2,
      intensity: 20,
    });
    expect(result.current.points[2]).toEqual({
      angle: Math.PI / 2,
      distance: 3,
      intensity: 30,
    });
  });

  it('filters out NaN and Infinity ranges', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useLidarSubscription(fakeRos, '/scan'),
    );

    const scan = makeLaserScan({
      ranges: [1, NaN, Infinity, -Infinity, 2],
      intensities: [10, 20, 30, 40, 50],
      range_min: 0.1,
      range_max: 10,
    });

    act(() => {
      capturedOnMessage?.(scan);
    });

    expect(result.current.points).toHaveLength(2);
    expect(result.current.points[0]?.distance).toBe(1);
    expect(result.current.points[1]?.distance).toBe(2);
  });

  it('filters out ranges below range_min and above range_max', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useLidarSubscription(fakeRos, '/scan'),
    );

    const scan = makeLaserScan({
      ranges: [0.05, 5, 15],
      intensities: [10, 20, 30],
      range_min: 0.1,
      range_max: 10,
    });

    act(() => {
      capturedOnMessage?.(scan);
    });

    expect(result.current.points).toHaveLength(1);
    expect(result.current.points[0]?.distance).toBe(5);
  });

  it('returns empty points for empty ranges array', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useLidarSubscription(fakeRos, '/scan'),
    );

    const scan = makeLaserScan({
      ranges: [],
      intensities: [],
    });

    act(() => {
      capturedOnMessage?.(scan);
    });

    expect(result.current.points).toEqual([]);
  });

  it('defaults intensity to 0 when intensities array is shorter than ranges', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useLidarSubscription(fakeRos, '/scan'),
    );

    const scan = makeLaserScan({
      ranges: [1, 2, 3],
      intensities: [100],
      range_min: 0.1,
      range_max: 10,
    });

    act(() => {
      capturedOnMessage?.(scan);
    });

    expect(result.current.points).toHaveLength(3);
    expect(result.current.points[0]?.intensity).toBe(100);
    expect(result.current.points[1]?.intensity).toBe(0);
    expect(result.current.points[2]?.intensity).toBe(0);
  });
});
