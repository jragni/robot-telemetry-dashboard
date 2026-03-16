import { describe, it, expect, beforeEach } from 'vitest';

import { useWebRTCStore } from './webrtc.store';

import type {
  ConnectionError,
  ConnectionState,
} from '@/types/connection.types';

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
  code: 'WEBRTC_ERR',
  timestamp: Date.now(),
});

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('useWebRTCStore', () => {
  beforeEach(() => {
    useWebRTCStore.setState(initialState);
  });

  // -------------------------------------------------------------------------
  // setConnectionState
  // -------------------------------------------------------------------------

  describe('setConnectionState', () => {
    it('creates an entry and sets the connection state for a new robot', () => {
      useWebRTCStore.getState().setConnectionState(ROBOT_ID, 'connecting');

      const entry = useWebRTCStore.getState().connections[ROBOT_ID];
      expect(entry).toBeDefined();
      expect(entry.connectionState).toBe('connecting');
    });

    it('updates the connection state for an existing robot', () => {
      useWebRTCStore.getState().setConnectionState(ROBOT_ID, 'connecting');
      useWebRTCStore.getState().setConnectionState(ROBOT_ID, 'connected');

      expect(
        useWebRTCStore.getState().connections[ROBOT_ID].connectionState
      ).toBe('connected');
    });

    it('preserves the existing error when updating connection state', () => {
      const error = makeError('ICE failure');
      useWebRTCStore.getState().setConnectionState(ROBOT_ID, 'error');
      useWebRTCStore.getState().setConnectionError(ROBOT_ID, error);
      useWebRTCStore.getState().setConnectionState(ROBOT_ID, 'connecting');

      expect(useWebRTCStore.getState().connections[ROBOT_ID].error).toEqual(
        error
      );
    });

    it('does not affect entries for other robots', () => {
      useWebRTCStore.getState().setConnectionState(ROBOT_ID, 'connected');
      useWebRTCStore.getState().setConnectionState('robot-002', 'error');

      expect(
        useWebRTCStore.getState().connections[ROBOT_ID].connectionState
      ).toBe('connected');
    });
  });

  // -------------------------------------------------------------------------
  // setConnectionError
  // -------------------------------------------------------------------------

  describe('setConnectionError', () => {
    it('stores the error for a robot', () => {
      const error = makeError('peer disconnected');
      useWebRTCStore.getState().setConnectionError(ROBOT_ID, error);

      expect(useWebRTCStore.getState().connections[ROBOT_ID].error).toEqual(
        error
      );
    });

    it('allows clearing the error by setting null', () => {
      const error = makeError('some error');
      useWebRTCStore.getState().setConnectionError(ROBOT_ID, error);
      useWebRTCStore.getState().setConnectionError(ROBOT_ID, null);

      expect(useWebRTCStore.getState().connections[ROBOT_ID].error).toBeNull();
    });

    it('preserves the existing connectionState when updating the error', () => {
      useWebRTCStore.getState().setConnectionState(ROBOT_ID, 'connected');
      useWebRTCStore.getState().setConnectionError(ROBOT_ID, makeError('oops'));

      expect(
        useWebRTCStore.getState().connections[ROBOT_ID].connectionState
      ).toBe('connected');
    });
  });

  // -------------------------------------------------------------------------
  // removeConnection
  // -------------------------------------------------------------------------

  describe('removeConnection', () => {
    it('removes the entry for the specified robot', () => {
      useWebRTCStore.getState().setConnectionState(ROBOT_ID, 'connected');
      useWebRTCStore.getState().removeConnection(ROBOT_ID);

      expect(useWebRTCStore.getState().connections[ROBOT_ID]).toBeUndefined();
    });

    it('does not affect entries for other robots', () => {
      useWebRTCStore.getState().setConnectionState(ROBOT_ID, 'connected');
      useWebRTCStore.getState().setConnectionState('robot-002', 'connected');

      useWebRTCStore.getState().removeConnection('robot-002');

      expect(useWebRTCStore.getState().connections[ROBOT_ID]).toBeDefined();
    });

    it('is a no-op for an unknown robot id', () => {
      useWebRTCStore.getState().setConnectionState(ROBOT_ID, 'connected');
      useWebRTCStore.getState().removeConnection('non-existent');

      expect(useWebRTCStore.getState().connections[ROBOT_ID]).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // getConnectionState
  // -------------------------------------------------------------------------

  describe('getConnectionState', () => {
    it('returns the stored connection state for a known robot', () => {
      useWebRTCStore.getState().setConnectionState(ROBOT_ID, 'connected');

      expect(useWebRTCStore.getState().getConnectionState(ROBOT_ID)).toBe(
        'connected'
      );
    });

    it('returns "disconnected" for an unknown robot id', () => {
      expect(useWebRTCStore.getState().getConnectionState('ghost-robot')).toBe(
        'disconnected'
      );
    });
  });
});
