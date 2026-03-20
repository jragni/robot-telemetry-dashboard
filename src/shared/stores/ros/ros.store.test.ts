import { describe, expect, it, beforeEach } from 'vitest';

import { useRosStore } from './ros.store';

describe('ros.store', () => {
  beforeEach(() => {
    useRosStore.setState({ connectionStates: {} });
  });

  it('starts with empty connection states', () => {
    const state = useRosStore.getState();
    expect(state.connectionStates).toEqual({});
  });

  it('setConnectionState() sets per-robot connection state', () => {
    const { setConnectionState } = useRosStore.getState();
    setConnectionState('robot-1', 'connecting');

    const state = useRosStore.getState();
    expect(state.connectionStates['robot-1']).toEqual({
      state: 'connecting',
      error: null,
    });
  });

  it('setConnectionState() updates existing robot state', () => {
    const { setConnectionState } = useRosStore.getState();
    setConnectionState('robot-1', 'connecting');
    setConnectionState('robot-1', 'connected');

    const state = useRosStore.getState();
    expect(state.connectionStates['robot-1'].state).toBe('connected');
  });

  it('setConnectionError() sets per-robot error', () => {
    const { setConnectionState, setConnectionError } = useRosStore.getState();
    setConnectionState('robot-1', 'error');
    setConnectionError('robot-1', 'Connection refused');

    const state = useRosStore.getState();
    expect(state.connectionStates['robot-1']).toEqual({
      state: 'error',
      error: 'Connection refused',
    });
  });

  it('setConnectionError(null) clears the error', () => {
    const { setConnectionState, setConnectionError } = useRosStore.getState();
    setConnectionState('robot-1', 'error');
    setConnectionError('robot-1', 'Connection refused');
    setConnectionError('robot-1', null);

    const state = useRosStore.getState();
    expect(state.connectionStates['robot-1'].error).toBeNull();
  });

  it('getConnectionState() returns current state for a robot', () => {
    const { setConnectionState, getConnectionState } = useRosStore.getState();
    setConnectionState('robot-1', 'connected');

    const robotState = getConnectionState('robot-1');
    expect(robotState).toEqual({ state: 'connected', error: null });
  });

  it('getConnectionState() returns disconnected for unknown robot', () => {
    const { getConnectionState } = useRosStore.getState();
    const robotState = getConnectionState('unknown-robot');
    expect(robotState).toEqual({ state: 'disconnected', error: null });
  });

  it('removeRobot() removes connection state for a robot', () => {
    const { setConnectionState, removeRobot } = useRosStore.getState();
    setConnectionState('robot-1', 'connected');
    setConnectionState('robot-2', 'connected');

    removeRobot('robot-1');

    const state = useRosStore.getState();
    expect(state.connectionStates['robot-1']).toBeUndefined();
    expect(state.connectionStates['robot-2']).toBeDefined();
  });

  it('handles multiple robots independently', () => {
    const { setConnectionState } = useRosStore.getState();
    setConnectionState('robot-1', 'connected');
    setConnectionState('robot-2', 'error');
    setConnectionState('robot-3', 'connecting');

    const state = useRosStore.getState();
    expect(state.connectionStates['robot-1'].state).toBe('connected');
    expect(state.connectionStates['robot-2'].state).toBe('error');
    expect(state.connectionStates['robot-3'].state).toBe('connecting');
  });
});
