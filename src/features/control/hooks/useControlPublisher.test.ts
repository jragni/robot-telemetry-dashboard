import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useControlPublisher } from './useControlPublisher';

import { useRosConnection } from '@/features/telemetry/shared/useRosConnection';
import { createTopicPublisher } from '@/services/ros/TopicPublisher';
import { useControlStore } from '@/stores/control.store';
import { useRosStore } from '@/stores/ros.store';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock useRosConnection so we can control connection state without roslib
vi.mock('@/features/telemetry/shared/useRosConnection', () => ({
  useRosConnection: vi.fn(),
}));

// Mock createTopicPublisher — we capture the published messages
const mockPublish = vi.fn();
const mockDestroy = vi.fn();

vi.mock('@/services/ros/TopicPublisher', () => ({
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

const ROBOT_ID = 'robot-test';

/** A minimal fake ROSLIB.Ros instance — only needs to be truthy. */
const fakeRos = {} as import('roslib').Ros;

function setConnected() {
  mockUseRosConnection.mockReturnValue({
    ros: fakeRos,
    connectionState: 'connected',
  });
}

function setDisconnected() {
  mockUseRosConnection.mockReturnValue({
    ros: null,
    connectionState: 'disconnected',
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useControlPublisher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset control store to clean state
    useControlStore.setState({ robotControls: {} });
    // Reset ros store
    useRosStore.setState({ connections: {}, topics: {} });
    // Default: disconnected
    setDisconnected();
  });

  // -------------------------------------------------------------------------
  // Return shape
  // -------------------------------------------------------------------------

  describe('return shape', () => {
    it('returns a publish function and isReady boolean', () => {
      const { result } = renderHook(() => useControlPublisher(ROBOT_ID));

      expect(typeof result.current.publish).toBe('function');
      expect(typeof result.current.isReady).toBe('boolean');
    });
  });

  // -------------------------------------------------------------------------
  // isReady
  // -------------------------------------------------------------------------

  describe('isReady', () => {
    it('is false when not connected', () => {
      setDisconnected();
      const { result } = renderHook(() => useControlPublisher(ROBOT_ID));

      expect(result.current.isReady).toBe(false);
    });

    it('is true when connected', () => {
      setConnected();
      const { result } = renderHook(() => useControlPublisher(ROBOT_ID));

      expect(result.current.isReady).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Twist message construction
  // -------------------------------------------------------------------------

  describe('publish direction messages', () => {
    beforeEach(() => {
      setConnected();
      // Set known velocity values on the store for ROBOT_ID
      useControlStore.getState().setLinearVelocity(ROBOT_ID, 1.0);
      useControlStore.getState().setAngularVelocity(ROBOT_ID, 0.8);
    });

    it('publish("forward") sends positive linear.x with zero angular', () => {
      const { result } = renderHook(() => useControlPublisher(ROBOT_ID));

      act(() => {
        result.current.publish('forward');
      });

      expect(mockPublish).toHaveBeenCalledWith({
        linear: { x: 1.0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 },
      });
    });

    it('publish("backward") sends negative linear.x with zero angular', () => {
      const { result } = renderHook(() => useControlPublisher(ROBOT_ID));

      act(() => {
        result.current.publish('backward');
      });

      expect(mockPublish).toHaveBeenCalledWith({
        linear: { x: -1.0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 },
      });
    });

    it('publish("left") sends positive angular.z with zero linear', () => {
      const { result } = renderHook(() => useControlPublisher(ROBOT_ID));

      act(() => {
        result.current.publish('left');
      });

      expect(mockPublish).toHaveBeenCalledWith({
        linear: { x: 0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0.8 },
      });
    });

    it('publish("right") sends negative angular.z with zero linear', () => {
      const { result } = renderHook(() => useControlPublisher(ROBOT_ID));

      act(() => {
        result.current.publish('right');
      });

      expect(mockPublish).toHaveBeenCalledWith({
        linear: { x: 0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: -0.8 },
      });
    });

    it('publish("stop") sends all zeros', () => {
      const { result } = renderHook(() => useControlPublisher(ROBOT_ID));

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
  // Velocity values from store
  // -------------------------------------------------------------------------

  describe('velocity values from control store', () => {
    it('uses the linearVelocity from the control store for forward', () => {
      setConnected();
      useControlStore.getState().setLinearVelocity(ROBOT_ID, 1.5);

      const { result } = renderHook(() => useControlPublisher(ROBOT_ID));

      act(() => {
        result.current.publish('forward');
      });

      expect(mockPublish).toHaveBeenCalledWith(
        expect.objectContaining({
          linear: { x: 1.5, y: 0, z: 0 },
        })
      );
    });

    it('uses the angularVelocity from the control store for left', () => {
      setConnected();
      useControlStore.getState().setAngularVelocity(ROBOT_ID, 1.2);

      const { result } = renderHook(() => useControlPublisher(ROBOT_ID));

      act(() => {
        result.current.publish('left');
      });

      expect(mockPublish).toHaveBeenCalledWith(
        expect.objectContaining({
          angular: { x: 0, y: 0, z: 1.2 },
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // Publisher lifecycle
  // -------------------------------------------------------------------------

  describe('publisher lifecycle', () => {
    it('does not call createTopicPublisher when disconnected', () => {
      setDisconnected();
      renderHook(() => useControlPublisher(ROBOT_ID));

      expect(mockCreateTopicPublisher).not.toHaveBeenCalled();
    });

    it('calls createTopicPublisher with correct args when connected', () => {
      setConnected();
      // Set a specific topic in the store
      useControlStore.getState().setSelectedTopic(ROBOT_ID, '/cmd_vel');

      renderHook(() => useControlPublisher(ROBOT_ID));

      expect(mockCreateTopicPublisher).toHaveBeenCalledWith(
        fakeRos,
        '/cmd_vel',
        'geometry_msgs/Twist'
      );
    });

    it('publish is a no-op when not connected', () => {
      setDisconnected();
      const { result } = renderHook(() => useControlPublisher(ROBOT_ID));

      act(() => {
        result.current.publish('forward');
      });

      expect(mockPublish).not.toHaveBeenCalled();
    });
  });
});
