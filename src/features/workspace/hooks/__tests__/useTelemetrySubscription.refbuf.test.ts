import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTelemetrySubscription } from '../useTelemetrySubscription';

// Capture the onMessage callback registered by useRosSubscriber
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

// Mock rafThrottle to execute synchronously
vi.mock('@/utils/rafThrottle', () => ({
  rafThrottle: (fn: (...args: never[]) => void) => {
    const throttled = (...args: Parameters<typeof fn>) => {
      (fn as (...a: unknown[]) => void)(...args);
    };
    throttled.cancel = vi.fn();
    return throttled;
  },
}));

const VALID_ODOM = {
  twist: {
    twist: {
      linear: { x: 1.5, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: 0.3 },
    },
  },
};

describe('useTelemetrySubscription ref-based buffer', () => {
  beforeEach(() => {
    capturedOnMessage = null;
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(
      (cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      },
    );
  });

  it('reuses the same buffer array reference instead of copying', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useTelemetrySubscription(fakeRos, '/odom', 'nav_msgs/msg/Odometry'),
    );

    expect(capturedOnMessage).not.toBeNull();

    // Send first message
    act(() => {
      capturedOnMessage?.({...VALID_ODOM});
    });

    const seriesAfterFirst = result.current;
    expect(seriesAfterFirst.length).toBe(2);
    const dataRef1 = seriesAfterFirst[0]?.data;
    expect(dataRef1).toBeDefined();

    // Send second message
    act(() => {
      capturedOnMessage?.({...VALID_ODOM});
    });

    const seriesAfterSecond = result.current;
    // The data array should be the SAME reference (mutated in place), not a copy
    expect(seriesAfterSecond[0]?.data).toBe(dataRef1);
  });

  it('triggers re-render when new data arrives', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useTelemetrySubscription(fakeRos, '/odom', 'nav_msgs/msg/Odometry'),
    );

    expect(result.current).toHaveLength(0);

    act(() => {
      capturedOnMessage?.({...VALID_ODOM});
    });

    // Should have series data after message
    expect(result.current.length).toBe(2);
    expect(result.current[0]?.data.length).toBe(1);

    act(() => {
      capturedOnMessage?.({...VALID_ODOM});
    });

    // Data should accumulate
    expect(result.current[0]?.data.length).toBe(2);
  });

  it('respects MAX_POINTS by shifting old entries', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useTelemetrySubscription(fakeRos, '/odom', 'nav_msgs/msg/Odometry'),
    );

    // Send 601 messages to exceed MAX_POINTS (600)
    act(() => {
      for (let i = 0; i < 601; i++) {
        capturedOnMessage?.({...VALID_ODOM});
      }
    });

    expect(result.current[0]?.data.length).toBe(600);
  });
});
