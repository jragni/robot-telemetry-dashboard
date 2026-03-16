import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useFleetStatus } from './useFleetStatus';

import { useConnectionsStore } from '@/stores/connections.store';
import { useControlStore } from '@/stores/control.store';
import { useRosStore } from '@/stores/ros.store';
import { useWebRTCStore } from '@/stores/webrtc.store';

// ---------------------------------------------------------------------------
// Store state helpers
// ---------------------------------------------------------------------------

function seedStores(
  robots: { id: string; name: string; baseUrl: string; createdAt: number }[],
  rosStates: Record<string, string> = {},
  webrtcStates: Record<string, string> = {}
) {
  useConnectionsStore.setState({ robots, activeRobotId: null });

  const rosConnections: Record<
    string,
    { connectionState: string; error: null }
  > = {};
  const webrtcConnections: Record<
    string,
    { connectionState: string; error: null }
  > = {};

  for (const robot of robots) {
    rosConnections[robot.id] = {
      connectionState: rosStates[robot.id] ?? 'disconnected',
      error: null,
    };
    webrtcConnections[robot.id] = {
      connectionState: webrtcStates[robot.id] ?? 'disconnected',
      error: null,
    };
  }

  useRosStore.setState({ connections: rosConnections, topics: {} });
  useWebRTCStore.setState({ connections: webrtcConnections });
  useControlStore.setState({ robotControls: {} });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useFleetStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    seedStores([]);
  });

  // -------------------------------------------------------------------------
  // Empty fleet
  // -------------------------------------------------------------------------

  describe('empty fleet', () => {
    it('returns an empty robots array when no robots are configured', () => {
      const { result } = renderHook(() => useFleetStatus());

      expect(result.current.robots).toHaveLength(0);
    });

    it('returns totalCount of 0 when no robots are configured', () => {
      const { result } = renderHook(() => useFleetStatus());

      expect(result.current.totalCount).toBe(0);
    });

    it('returns connectedCount of 0 when no robots are configured', () => {
      const { result } = renderHook(() => useFleetStatus());

      expect(result.current.connectedCount).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // Single robot — disconnected
  // -------------------------------------------------------------------------

  describe('single robot disconnected', () => {
    const robot = {
      id: 'robot-1',
      name: 'Alpha',
      baseUrl: 'ws://alpha:9090',
      createdAt: 1000,
    };

    beforeEach(() => seedStores([robot]));

    it('returns one RobotStatus entry', () => {
      const { result } = renderHook(() => useFleetStatus());

      expect(result.current.robots).toHaveLength(1);
    });

    it('entry carries the robot configuration', () => {
      const { result } = renderHook(() => useFleetStatus());

      expect(result.current.robots[0].robot.id).toBe('robot-1');
      expect(result.current.robots[0].robot.name).toBe('Alpha');
    });

    it('isConnected is false when both states are disconnected', () => {
      const { result } = renderHook(() => useFleetStatus());

      expect(result.current.robots[0].isConnected).toBe(false);
    });

    it('connectedCount is 0 when no robots are connected', () => {
      const { result } = renderHook(() => useFleetStatus());

      expect(result.current.connectedCount).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // Multiple robots — mixed states
  // -------------------------------------------------------------------------

  describe('multiple robots with mixed connection states', () => {
    const robots = [
      { id: 'r1', name: 'Alpha', baseUrl: 'ws://alpha:9090', createdAt: 1 },
      { id: 'r2', name: 'Beta', baseUrl: 'ws://beta:9090', createdAt: 2 },
      { id: 'r3', name: 'Gamma', baseUrl: 'ws://gamma:9090', createdAt: 3 },
    ];

    beforeEach(() =>
      seedStores(
        robots,
        { r1: 'connected', r2: 'connected', r3: 'disconnected' },
        { r1: 'connected', r2: 'disconnected', r3: 'disconnected' }
      )
    );

    it('returns the correct total count', () => {
      const { result } = renderHook(() => useFleetStatus());

      expect(result.current.totalCount).toBe(3);
    });

    it('connectedCount only counts robots with both ROS and WebRTC connected', () => {
      // r1 has both connected → counted; r2 has only ROS connected → not counted
      const { result } = renderHook(() => useFleetStatus());

      expect(result.current.connectedCount).toBe(1);
    });

    it('correct rosState is reflected per robot', () => {
      const { result } = renderHook(() => useFleetStatus());

      const r1 = result.current.robots.find((r) => r.robot.id === 'r1');
      const r3 = result.current.robots.find((r) => r.robot.id === 'r3');

      expect(r1?.rosState).toBe('connected');
      expect(r3?.rosState).toBe('disconnected');
    });

    it('correct webrtcState is reflected per robot', () => {
      const { result } = renderHook(() => useFleetStatus());

      const r1 = result.current.robots.find((r) => r.robot.id === 'r1');
      const r2 = result.current.robots.find((r) => r.robot.id === 'r2');

      expect(r1?.webrtcState).toBe('connected');
      expect(r2?.webrtcState).toBe('disconnected');
    });

    it('isConnected is true only for robots with both states connected', () => {
      const { result } = renderHook(() => useFleetStatus());

      const r1 = result.current.robots.find((r) => r.robot.id === 'r1');
      const r2 = result.current.robots.find((r) => r.robot.id === 'r2');

      expect(r1?.isConnected).toBe(true);
      expect(r2?.isConnected).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Control state
  // -------------------------------------------------------------------------

  describe('control state fallback', () => {
    const robot = {
      id: 'ctrl-robot',
      name: 'Control Test',
      baseUrl: 'ws://test:9090',
      createdAt: 1,
    };

    it('returns default control values when no control state is stored', () => {
      seedStores([robot]);
      const { result } = renderHook(() => useFleetStatus());

      const entry = result.current.robots[0];
      expect(typeof entry.controlState.linearVelocity).toBe('number');
      expect(typeof entry.controlState.angularVelocity).toBe('number');
      expect(typeof entry.controlState.isEStopActive).toBe('boolean');
    });
  });
});
