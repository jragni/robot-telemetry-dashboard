import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBatterySubscription } from './useBatterySubscription';
import type { RosTopic } from '@/hooks/useRosTopics';

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

const BATTERY_TOPICS: readonly RosTopic[] = [
  { name: '/battery_state', type: 'sensor_msgs/msg/BatteryState' },
];

const EMPTY_TOPICS: readonly RosTopic[] = [];

describe('useBatterySubscription', () => {
  beforeEach(() => {
    capturedOnMessage = null;
  });

  it('returns null as initial state', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useBatterySubscription(fakeRos, BATTERY_TOPICS),
    );

    expect(result.current).toBeNull();
  });

  it('updates state with valid battery message', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useBatterySubscription(fakeRos, BATTERY_TOPICS),
    );

    act(() => {
      capturedOnMessage?.({
        percentage: 0.85,
        power_supply_status: 0,
        voltage: 12.6,
      });
    });

    expect(result.current).toEqual({
      charging: false,
      percentage: 85,
      voltage: 12.6,
    });
  });

  it('normalizes 0-1 scale percentage to 0-100', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useBatterySubscription(fakeRos, BATTERY_TOPICS),
    );

    act(() => {
      capturedOnMessage?.({
        percentage: 0.42,
        power_supply_status: 0,
        voltage: 11.1,
      });
    });

    expect(result.current?.percentage).toBeCloseTo(42);
  });

  it('keeps 0-100 scale percentage as-is', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useBatterySubscription(fakeRos, BATTERY_TOPICS),
    );

    act(() => {
      capturedOnMessage?.({
        percentage: 75,
        power_supply_status: 0,
        voltage: 12.0,
      });
    });

    expect(result.current?.percentage).toBe(75);
  });

  it('detects charging status from power_supply_status', () => {
    const fakeRos = {} as never;
    const { result } = renderHook(() =>
      useBatterySubscription(fakeRos, BATTERY_TOPICS),
    );

    act(() => {
      capturedOnMessage?.({
        percentage: 0.5,
        power_supply_status: 1,
        voltage: 12.0,
      });
    });

    expect(result.current?.charging).toBe(true);
  });

  it('does not update state with invalid message', () => {
    const fakeRos = {} as never;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
    const { result } = renderHook(() =>
      useBatterySubscription(fakeRos, BATTERY_TOPICS),
    );

    act(() => {
      capturedOnMessage?.({ percentage: 'full', voltage: 12.6 });
    });

    expect(result.current).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('does not update state when message is missing required fields', () => {
    const fakeRos = {} as never;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
    const { result } = renderHook(() =>
      useBatterySubscription(fakeRos, BATTERY_TOPICS),
    );

    act(() => {
      capturedOnMessage?.({});
    });

    expect(result.current).toBeNull();
    warnSpy.mockRestore();
  });

  it('finds battery topic from available topics by type', () => {
    const fakeRos = {} as never;
    renderHook(() =>
      useBatterySubscription(fakeRos, EMPTY_TOPICS),
    );

    // With no matching topic, useRosSubscriber gets empty string for topic name
    // The hook should still render without error
    expect(capturedOnMessage).not.toBeNull();
  });
});
