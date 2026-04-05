import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRosTopics } from '../useRosTopics';
import type { Ros } from 'roslib';

function createMockRos(topics: string[], types: string[]): Ros {
  return {
    getTopics: vi.fn((success: (result: { topics: string[]; types: string[] }) => void) => {
      success({ topics, types });
    }),
  } as unknown as Ros;
}

describe('useRosTopics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('does not update state when topics are unchanged across intervals', () => {
    const topics = ['/scan', '/odom'];
    const types = ['sensor_msgs/msg/LaserScan', 'nav_msgs/msg/Odometry'];
    const ros = createMockRos(topics, types);

    const { result } = renderHook(() => useRosTopics(ros));

    const firstRef = result.current;
    expect(firstRef).toHaveLength(2);

    // Advance past the 10s interval — triggers a re-fetch with identical data
    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    // Array reference should be the same (no unnecessary re-render)
    expect(result.current).toBe(firstRef);
  });

  it('updates state when topics change', () => {
    const ros = createMockRos(['/scan'], ['sensor_msgs/msg/LaserScan']);

    const { result } = renderHook(() => useRosTopics(ros));

    const firstRef = result.current;
    expect(firstRef).toHaveLength(1);

    // Mutate the mock to return different topics on next fetch
    (ros.getTopics as ReturnType<typeof vi.fn>).mockImplementation(
      (success: (result: { topics: string[]; types: string[] }) => void) => {
        success({ topics: ['/scan', '/odom'], types: ['sensor_msgs/msg/LaserScan', 'nav_msgs/msg/Odometry'] });
      },
    );

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(result.current).not.toBe(firstRef);
    expect(result.current).toHaveLength(2);
  });
});
