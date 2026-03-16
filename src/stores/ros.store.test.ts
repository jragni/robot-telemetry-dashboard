import { describe, it, expect, beforeEach } from 'vitest';

import { useRosStore } from './ros.store';

import type { ConnectionError, ConnectionState } from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const initialState = {
  connections: {} as Record<
    string,
    { connectionState: ConnectionState; error: ConnectionError | null }
  >,
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
});
