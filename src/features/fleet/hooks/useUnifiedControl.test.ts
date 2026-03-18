import { renderHook, act } from '@testing-library/react';
import type { Ros } from 'roslib';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useUnifiedControl } from './useUnifiedControl';

import { useRosConnection } from '@/hooks/useRosConnection';
import { createTopicPublisher } from '@/services/ros/publisher/TopicPublisher';
import { useControlStore } from '@/stores/control/control.store';
import { useRosStore } from '@/stores/ros/ros.store';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/hooks/useRosConnection', () => ({
  useRosConnection: vi.fn(),
}));

const mockPublish = vi.fn();
const mockDestroy = vi.fn();

vi.mock('@/services/ros/publisher/TopicPublisher', () => ({
  createTopicPublisher: vi.fn(() => ({
    publish: mockPublish,
    destroy: mockDestroy,
  })),
}));

const mockUseRosConnection = vi.mocked(useRosConnection);
const mockCreateTopicPublisher = vi.mocked(createTopicPublisher);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fakeRos = {} as Ros;

function setConnected(robotId: string) {
  mockUseRosConnection.mockImplementation((id) => {
    if (id === robotId) {
      return { ros: fakeRos, connectionState: 'connected' };
    }
    return { ros: null, connectionState: 'disconnected' };
  });
}

function setAllConnected(robotIds: string[]) {
  mockUseRosConnection.mockImplementation((id) => {
    if (robotIds.includes(id ?? '')) {
      return { ros: fakeRos, connectionState: 'connected' };
    }
    return { ros: null, connectionState: 'disconnected' };
  });
}

function setAllDisconnected() {
  mockUseRosConnection.mockReturnValue({
    ros: null,
    connectionState: 'disconnected',
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useUnifiedControl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useControlStore.setState({ robotControls: {} });
    useRosStore.setState({ connections: {}, topics: {} });
    setAllDisconnected();
  });

  // -------------------------------------------------------------------------
  // Empty selection
  // -------------------------------------------------------------------------

  describe('empty selection', () => {
    it('isReady is false when no robots are selected', () => {
      const { result } = renderHook(() => useUnifiedControl([]));

      expect(result.current.isReady).toBe(false);
    });

    it('publish does not throw when no robots are selected', () => {
      const { result } = renderHook(() => useUnifiedControl([]));

      expect(() => {
        act(() => {
          result.current.publish('forward');
        });
      }).not.toThrow();
    });

    it('publish does not call underlying publisher when no robots are selected', () => {
      const { result } = renderHook(() => useUnifiedControl([]));

      act(() => {
        result.current.publish('forward');
      });

      expect(mockPublish).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Single robot selected, disconnected
  // -------------------------------------------------------------------------

  describe('single robot selected — disconnected', () => {
    it('isReady is false when selected robot is not connected', () => {
      setAllDisconnected();
      const { result } = renderHook(() => useUnifiedControl(['robot-a']));

      expect(result.current.isReady).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Single robot selected, connected
  // -------------------------------------------------------------------------

  describe('single robot selected — connected', () => {
    beforeEach(() => {
      setConnected('robot-a');
      useControlStore.getState().setLinearVelocity('robot-a', 1.0);
      useControlStore.getState().setAngularVelocity('robot-a', 0.5);
    });

    it('isReady is true when the selected robot is connected', () => {
      const { result } = renderHook(() => useUnifiedControl(['robot-a']));

      expect(result.current.isReady).toBe(true);
    });

    it('publish sends a Twist message to the connected robot', () => {
      const { result } = renderHook(() => useUnifiedControl(['robot-a']));

      act(() => {
        result.current.publish('forward');
      });

      expect(mockPublish).toHaveBeenCalledTimes(1);
      expect(mockPublish).toHaveBeenCalledWith(
        expect.objectContaining({
          linear: { x: 1.0, y: 0, z: 0 },
          angular: { x: 0, y: 0, z: 0 },
        })
      );
    });

    it('publish sends stop (all zeros) for stop direction', () => {
      const { result } = renderHook(() => useUnifiedControl(['robot-a']));

      act(() => {
        result.current.publish('stop');
      });

      expect(mockPublish).toHaveBeenCalledWith({
        linear: { x: 0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 },
      });
    });
  });

  // -------------------------------------------------------------------------
  // Multiple robots — broadcast
  // -------------------------------------------------------------------------

  describe('multiple robots selected — broadcasting', () => {
    beforeEach(() => {
      setAllConnected(['robot-a', 'robot-b']);
      useControlStore.getState().setLinearVelocity('robot-a', 1.0);
      useControlStore.getState().setLinearVelocity('robot-b', 1.0);
    });

    it('publish broadcasts to all selected robots', () => {
      // Two publishers will be created (one per robot)
      mockCreateTopicPublisher
        .mockReturnValueOnce({ publish: mockPublish, destroy: mockDestroy })
        .mockReturnValueOnce({ publish: mockPublish, destroy: mockDestroy });

      const { result } = renderHook(() =>
        useUnifiedControl(['robot-a', 'robot-b'])
      );

      act(() => {
        result.current.publish('forward');
      });

      // Both publishers receive the same command
      expect(mockPublish).toHaveBeenCalledTimes(2);
    });

    it('isReady is true only when ALL selected robots are connected', () => {
      // robot-b is disconnected
      setConnected('robot-a');
      mockUseRosConnection.mockImplementation((id) => {
        if (id === 'robot-a') {
          return { ros: fakeRos, connectionState: 'connected' };
        }
        return { ros: null, connectionState: 'disconnected' };
      });

      const { result } = renderHook(() =>
        useUnifiedControl(['robot-a', 'robot-b'])
      );

      expect(result.current.isReady).toBe(false);
    });
  });
});
