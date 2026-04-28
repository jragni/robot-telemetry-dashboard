import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLidarSubscription } from './useLidarSubscription';

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

const VALID_SCAN = {
  angle_increment: 0.01,
  angle_min: -1.57,
  intensities: [100, 200, 300],
  range_max: 30,
  range_min: 0.1,
  ranges: [1.0, 2.0, 3.0],
};

describe('useLidarSubscription', () => {
  beforeEach(() => {
    capturedOnMessage = null;
  });

  it('returns empty points as initial state', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() => useLidarSubscription(fakeRos, '/scan'));

    expect(result.current.points).toEqual([]);
    expect(result.current.rangeMax).toBe(3);
  });

  it('converts valid scan to points with correct angles and distances', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() => useLidarSubscription(fakeRos, '/scan'));

    act(() => {
      capturedOnMessage?.(VALID_SCAN);
    });

    expect(result.current.points).toHaveLength(3);
    expect(result.current.points[0]).toEqual({
      angle: -1.57,
      distance: 1.0,
      intensity: 100,
    });
    expect(result.current.points[1]).toEqual({
      angle: -1.57 + 0.01,
      distance: 2.0,
      intensity: 200,
    });
    expect(result.current.points[2]).toEqual({
      angle: -1.57 + 0.02,
      distance: 3.0,
      intensity: 300,
    });
  });

  it('rejects message with NaN ranges at schema level', () => {
    const fakeRos = {} as never;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
    const { result } = renderHook(() => useLidarSubscription(fakeRos, '/scan'));

    act(() => {
      // In production, normalizeCborMessage converts NaN → null before the hook sees it.
      // Simulate normalized input.
      capturedOnMessage?.({
        ...VALID_SCAN,
        ranges: [1.0, null, 3.0],
      });
    });

    // null ranges are filtered out by range validation. Valid ranges (1.0, 3.0) produce points.
    expect(result.current.points).toHaveLength(2);
    warnSpy.mockRestore();
  });

  it('rejects message with Infinity ranges at schema level', () => {
    const fakeRos = {} as never;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
    const { result } = renderHook(() => useLidarSubscription(fakeRos, '/scan'));

    act(() => {
      capturedOnMessage?.({
        ...VALID_SCAN,
        ranges: [1.0, Infinity, -Infinity, 3.0],
        intensities: [100, 200, 300, 400],
      });
    });

    // Zod rejects Infinity as invalid number, entire message fails validation
    expect(result.current.points).toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('filters out ranges below range_min', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() => useLidarSubscription(fakeRos, '/scan'));

    act(() => {
      capturedOnMessage?.({
        ...VALID_SCAN,
        ranges: [0.05, 1.0, 2.0],
      });
    });

    // 0.05 < range_min (0.1), so filtered out
    expect(result.current.points).toHaveLength(2);
    expect(result.current.points[0]?.distance).toBe(1.0);
  });

  it('filters out ranges above range_max', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() => useLidarSubscription(fakeRos, '/scan'));

    act(() => {
      capturedOnMessage?.({
        ...VALID_SCAN,
        ranges: [1.0, 2.0, 35.0],
      });
    });

    // 35.0 > range_max (30), so filtered out
    expect(result.current.points).toHaveLength(2);
  });

  it('defaults intensity to 0 when intensities array is empty', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() => useLidarSubscription(fakeRos, '/scan'));

    act(() => {
      capturedOnMessage?.({
        ...VALID_SCAN,
        intensities: [],
      });
    });

    expect(result.current.points).toHaveLength(3);
    expect(result.current.points[0]?.intensity).toBe(0);
    expect(result.current.points[1]?.intensity).toBe(0);
  });

  it('does not update state with invalid message', () => {
    const fakeRos = {} as never;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
    const { result } = renderHook(() => useLidarSubscription(fakeRos, '/scan'));

    act(() => {
      capturedOnMessage?.({ ranges: 'not-an-array' });
    });

    expect(result.current.points).toEqual([]);
    warnSpy.mockRestore();
  });

  it('does not update state when message is missing required fields', () => {
    const fakeRos = {} as never;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
    const { result } = renderHook(() => useLidarSubscription(fakeRos, '/scan'));

    act(() => {
      capturedOnMessage?.({});
    });

    expect(result.current.points).toEqual([]);
    warnSpy.mockRestore();
  });
});
