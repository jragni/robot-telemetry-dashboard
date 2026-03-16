import { describe, it, expect, beforeEach } from 'vitest';

import { useRosStore } from './ros.store';

import type { ConnectionError, ConnectionState, TopicInfo } from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const initialState = {
  connections: {} as Record<
    string,
    { connectionState: ConnectionState; error: ConnectionError | null }
  >,
  topics: {} as Record<string, TopicInfo[]>,
};

const ROBOT_ID = 'robot-001';

const makeError = (msg: string): ConnectionError => ({
  message: msg,
  code: 'TEST_ERR',
  timestamp: Date.now(),
});

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('useRosStore', () => {
  beforeEach(() => {
    useRosStore.setState(initialState);
  });

  // -------------------------------------------------------------------------
  // setConnectionState
  // -------------------------------------------------------------------------

  describe('setConnectionState', () => {
    it('creates an entry and sets the connection state for a new robot', () => {
      useRosStore.getState().setConnectionState(ROBOT_ID, 'connecting');

      const entry = useRosStore.getState().connections[ROBOT_ID];
      expect(entry).toBeDefined();
      expect(entry.connectionState).toBe('connecting');
    });

    it('updates the connection state for an existing robot', () => {
      useRosStore.getState().setConnectionState(ROBOT_ID, 'connecting');
      useRosStore.getState().setConnectionState(ROBOT_ID, 'connected');

      expect(useRosStore.getState().connections[ROBOT_ID].connectionState).toBe(
        'connected'
      );
    });

    it('preserves the existing error when updating connection state', () => {
      const error = makeError('connection timed out');
      useRosStore.getState().setConnectionState(ROBOT_ID, 'error');
      useRosStore.getState().setConnectionError(ROBOT_ID, error);
      useRosStore.getState().setConnectionState(ROBOT_ID, 'connecting');

      expect(useRosStore.getState().connections[ROBOT_ID].error).toEqual(error);
    });

    it('does not affect entries for other robots', () => {
      useRosStore.getState().setConnectionState(ROBOT_ID, 'connected');
      useRosStore.getState().setConnectionState('robot-002', 'error');

      expect(useRosStore.getState().connections[ROBOT_ID].connectionState).toBe(
        'connected'
      );
    });
  });

  // -------------------------------------------------------------------------
  // setConnectionError
  // -------------------------------------------------------------------------

  describe('setConnectionError', () => {
    it('stores the error for a robot', () => {
      const error = makeError('ROS bridge unreachable');
      useRosStore.getState().setConnectionError(ROBOT_ID, error);

      expect(useRosStore.getState().connections[ROBOT_ID].error).toEqual(error);
    });

    it('allows clearing the error by setting null', () => {
      const error = makeError('some error');
      useRosStore.getState().setConnectionError(ROBOT_ID, error);
      useRosStore.getState().setConnectionError(ROBOT_ID, null);

      expect(useRosStore.getState().connections[ROBOT_ID].error).toBeNull();
    });

    it('preserves the existing connectionState when updating the error', () => {
      useRosStore.getState().setConnectionState(ROBOT_ID, 'connected');
      useRosStore.getState().setConnectionError(ROBOT_ID, makeError('oops'));

      expect(useRosStore.getState().connections[ROBOT_ID].connectionState).toBe(
        'connected'
      );
    });
  });

  // -------------------------------------------------------------------------
  // removeConnection
  // -------------------------------------------------------------------------

  describe('removeConnection', () => {
    it('removes the entry for the specified robot', () => {
      useRosStore.getState().setConnectionState(ROBOT_ID, 'connected');
      useRosStore.getState().removeConnection(ROBOT_ID);

      expect(useRosStore.getState().connections[ROBOT_ID]).toBeUndefined();
    });

    it('does not affect entries for other robots', () => {
      useRosStore.getState().setConnectionState(ROBOT_ID, 'connected');
      useRosStore.getState().setConnectionState('robot-002', 'connected');

      useRosStore.getState().removeConnection('robot-002');

      expect(useRosStore.getState().connections[ROBOT_ID]).toBeDefined();
    });

    it('is a no-op for an unknown robot id', () => {
      useRosStore.getState().setConnectionState(ROBOT_ID, 'connected');
      useRosStore.getState().removeConnection('non-existent');

      expect(useRosStore.getState().connections[ROBOT_ID]).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // getConnectionState
  // -------------------------------------------------------------------------

  describe('getConnectionState', () => {
    it('returns the stored connection state for a known robot', () => {
      useRosStore.getState().setConnectionState(ROBOT_ID, 'connected');

      expect(useRosStore.getState().getConnectionState(ROBOT_ID)).toBe(
        'connected'
      );
    });

    it('returns "disconnected" for an unknown robot id', () => {
      expect(useRosStore.getState().getConnectionState('ghost-robot')).toBe(
        'disconnected'
      );
    });
  });

  // -------------------------------------------------------------------------
  // topics
  // -------------------------------------------------------------------------

  describe('topics', () => {
    const makeTopics = (...names: string[]): TopicInfo[] =>
      names.map((name) => ({ name, messageType: 'std_msgs/String' }));

    describe('setTopics', () => {
      it('stores topics array for robotId', () => {
        const topics = makeTopics('/cmd_vel', '/odom');
        useRosStore.getState().setTopics(ROBOT_ID, topics);

        expect(useRosStore.getState().topics[ROBOT_ID]).toEqual(topics);
      });

      it('replaces topics on subsequent calls for same robotId', () => {
        const first = makeTopics('/cmd_vel', '/odom');
        const second = makeTopics('/battery');

        useRosStore.getState().setTopics(ROBOT_ID, first);
        useRosStore.getState().setTopics(ROBOT_ID, second);

        expect(useRosStore.getState().topics[ROBOT_ID]).toEqual(second);
      });

      it("does not affect other robots' topics", () => {
        const topicsA = makeTopics('/cmd_vel');
        const topicsB = makeTopics('/odom');

        useRosStore.getState().setTopics(ROBOT_ID, topicsA);
        useRosStore.getState().setTopics('robot-002', topicsB);

        expect(useRosStore.getState().topics[ROBOT_ID]).toEqual(topicsA);
        expect(useRosStore.getState().topics['robot-002']).toEqual(topicsB);
      });
    });

    describe('getTopics', () => {
      it('returns stored topics for robotId', () => {
        const topics = makeTopics('/cmd_vel', '/odom');
        useRosStore.getState().setTopics(ROBOT_ID, topics);

        expect(useRosStore.getState().getTopics(ROBOT_ID)).toEqual(topics);
      });

      it('returns empty array for unknown robotId', () => {
        expect(useRosStore.getState().getTopics('ghost-robot')).toEqual([]);
      });
    });
  });
});
