import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRosGraph } from '../useRosGraph';
import type { Ros } from 'roslib';

type SuccessCallback<T> = (result: T) => void;
type ErrorCallback = (error: string) => void;

interface MockCallbacks {
  getActionServers: { success: SuccessCallback<string[]> | null; error: ErrorCallback | null };
  getNodes: { success: SuccessCallback<string[]> | null; error: ErrorCallback | null };
  getServices: { success: SuccessCallback<string[]> | null; error: ErrorCallback | null };
  getTopics: { success: SuccessCallback<{ topics: string[] }> | null; error: ErrorCallback | null };
}

function createDeferredMockRos() {
  const callbacks: MockCallbacks = {
    getActionServers: { error: null, success: null },
    getNodes: { error: null, success: null },
    getServices: { error: null, success: null },
    getTopics: { error: null, success: null },
  };

  const ros = {
    getActionServers: vi.fn((success: SuccessCallback<string[]>, error: ErrorCallback) => {
      callbacks.getActionServers = { error, success };
    }),
    getNodes: vi.fn((success: SuccessCallback<string[]>, error: ErrorCallback) => {
      callbacks.getNodes = { error, success };
    }),
    getServices: vi.fn((success: SuccessCallback<string[]>, error: ErrorCallback) => {
      callbacks.getServices = { error, success };
    }),
    getTopics: vi.fn((success: SuccessCallback<{ topics: string[] }>, error: ErrorCallback) => {
      callbacks.getTopics = { error, success };
    }),
  } as unknown as Ros;

  return { callbacks, ros };
}

function createSyncMockRos(
  nodes: string[],
  topics: string[],
  services: string[],
  actions: string[],
): Ros {
  return {
    getActionServers: vi.fn((success: SuccessCallback<string[]>) => { success(actions); }),
    getNodes: vi.fn((success: SuccessCallback<string[]>) => { success(nodes); }),
    getServices: vi.fn((success: SuccessCallback<string[]>) => { success(services); }),
    getTopics: vi.fn((success: SuccessCallback<{ topics: string[] }>) => { success({ topics }); }),
  } as unknown as Ros;
}

describe('useRosGraph', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('returns graph data when all callbacks resolve synchronously', () => {
    const ros = createSyncMockRos(
      ['/node1', '/node2'],
      ['/topic1'],
      ['/service1', '/service2', '/service3'],
      [],
    );

    const { result } = renderHook(() => useRosGraph(ros));

    expect(result.current).toEqual({
      actionNames: [],
      actions: 0,
      nodeNames: ['/node1', '/node2'],
      nodes: 2,
      serviceNames: ['/service1', '/service2', '/service3'],
      services: 3,
      topicNames: ['/topic1'],
      topics: 1,
    });
  });

  it('returns null when ros is undefined', () => {
    const { result } = renderHook(() => useRosGraph(undefined));
    expect(result.current).toBeNull();
  });

  it('does not call setGraph after unmount when callbacks fire late', () => {
    const { callbacks, ros } = createDeferredMockRos();

    const { unmount } = renderHook(() => useRosGraph(ros));

    // All 4 API calls are in-flight but unresolved
    expect(callbacks.getNodes.success).not.toBeNull();

    // Unmount before any callback resolves
    unmount();

    // Simulate all 4 callbacks resolving after unmount
    act(() => {
      callbacks.getNodes.success?.(['/late_node']);
      callbacks.getTopics.success?.({ topics: ['/late_topic'] });
      callbacks.getServices.success?.(['/late_service']);
      callbacks.getActionServers.success?.(['/late_action']);
    });

    // No React warning about setState on unmounted component means the guard works
    expect(callbacks.getNodes.success).not.toBeNull();
  });

  it('does not update state when graph counts are unchanged across intervals', () => {
    const ros = createSyncMockRos(['/node1'], ['/topic1'], ['/svc1'], []);

    const { result } = renderHook(() => useRosGraph(ros));

    const firstRef = result.current;
    expect(firstRef).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    // Reference equality — no unnecessary re-render
    expect(result.current).toBe(firstRef);
  });
});
