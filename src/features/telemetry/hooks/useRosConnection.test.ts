import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';

import { useRosConnection } from './useRosConnection';

import { useRosStore } from '@/shared/stores/ros/ros.store';

describe('useRosConnection', () => {
  beforeEach(() => {
    useRosStore.setState({ connectionStates: {} });
  });

  it('returns isConnected=false when no connection state set', () => {
    const { result } = renderHook(() => useRosConnection('robot-1'));
    expect(result.current.isConnected).toBe(false);
  });

  it('returns isConnected=true when connectionState is connected', () => {
    useRosStore.getState().setConnectionState('robot-1', 'connected');
    const { result } = renderHook(() => useRosConnection('robot-1'));
    expect(result.current.isConnected).toBe(true);
  });

  it('returns isConnected=false when connectionState is connecting', () => {
    useRosStore.getState().setConnectionState('robot-1', 'connecting');
    const { result } = renderHook(() => useRosConnection('robot-1'));
    expect(result.current.isConnected).toBe(false);
  });

  it('returns isConnected=false when connectionState is error', () => {
    useRosStore.getState().setConnectionState('robot-1', 'error');
    const { result } = renderHook(() => useRosConnection('robot-1'));
    expect(result.current.isConnected).toBe(false);
  });

  it('returns isConnected=false when connectionState is disconnected', () => {
    useRosStore.getState().setConnectionState('robot-1', 'disconnected');
    const { result } = renderHook(() => useRosConnection('robot-1'));
    expect(result.current.isConnected).toBe(false);
  });

  it('returns the connectionState value', () => {
    useRosStore.getState().setConnectionState('robot-1', 'connecting');
    const { result } = renderHook(() => useRosConnection('robot-1'));
    expect(result.current.connectionState).toBe('connecting');
  });

  it('re-renders when connection state changes', () => {
    useRosStore.getState().setConnectionState('robot-1', 'disconnected');
    const { result } = renderHook(() => useRosConnection('robot-1'));

    expect(result.current.isConnected).toBe(false);

    act(() => {
      useRosStore.getState().setConnectionState('robot-1', 'connected');
    });

    expect(result.current.isConnected).toBe(true);
  });

  it('is stable across robots — robot-2 change does not affect robot-1 hook', () => {
    useRosStore.getState().setConnectionState('robot-1', 'connected');
    const { result } = renderHook(() => useRosConnection('robot-1'));

    const initialState = result.current.connectionState;

    act(() => {
      useRosStore.getState().setConnectionState('robot-2', 'error');
    });

    expect(result.current.connectionState).toBe(initialState);
  });
});
