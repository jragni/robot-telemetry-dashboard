import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { RosTransport } from './RosTransport';

import { MockRos } from '@/test/mocks/roslib.mock';

describe('RosTransport', () => {
  let transport: RosTransport;
  let mockRos: MockRos;

  beforeEach(() => {
    vi.useFakeTimers();
    mockRos = new MockRos();
    transport = new RosTransport({
      robotId: 'robot-1',
      url: 'ws://localhost:9090',
      rosFactory: () => mockRos,
    });
  });

  afterEach(() => {
    transport.destroy();
    vi.useRealTimers();
  });

  it('creates with a robotId', () => {
    expect(transport.robotId).toBe('robot-1');
  });

  it('starts in disconnected state', () => {
    expect(transport.connectionState$.getValue()).toBe('disconnected');
  });

  it('transitions to connecting then connected on successful connect', () => {
    const states: string[] = [];
    transport.connectionState$.subscribe((s) => states.push(s));

    transport.connect();

    expect(states).toEqual(['disconnected', 'connecting', 'connected']);
  });

  it('transitions to error state on connection failure', () => {
    const errorRos = new MockRos();
    // Override connect to emit error instead of connection
    errorRos.connect = () => {
      errorRos.emit('error', new Error('Connection refused'));
    };

    const errorTransport = new RosTransport({
      robotId: 'robot-err',
      url: 'ws://invalid:9090',
      rosFactory: () => errorRos,
      maxReconnectAttempts: 0,
    });

    const states: string[] = [];
    errorTransport.connectionState$.subscribe((s) => states.push(s));

    errorTransport.connect();

    expect(states).toEqual(['disconnected', 'connecting', 'error']);

    errorTransport.destroy();
  });

  it('transitions to disconnected on disconnect()', () => {
    transport.connect();

    const states: string[] = [];
    transport.connectionState$.subscribe((s) => states.push(s));

    transport.disconnect();

    expect(states).toEqual(['connected', 'disconnected']);
  });

  it('is a no-op when calling connect() while already connected', () => {
    transport.connect();
    expect(transport.connectionState$.getValue()).toBe('connected');

    transport.connect();
    expect(transport.connectionState$.getValue()).toBe('connected');
  });

  it('is a no-op when calling disconnect() while already disconnected', () => {
    expect(transport.connectionState$.getValue()).toBe('disconnected');
    transport.disconnect();
    expect(transport.connectionState$.getValue()).toBe('disconnected');
  });

  it('auto-reconnects after connection loss up to max attempts', () => {
    const reconnectTransport = new RosTransport({
      robotId: 'robot-reconnect',
      url: 'ws://localhost:9090',
      rosFactory: () => mockRos,
      maxReconnectAttempts: 3,
      baseReconnectIntervalMs: 1000,
      backoffMultiplier: 2,
    });

    reconnectTransport.connect();
    expect(reconnectTransport.connectionState$.getValue()).toBe('connected');

    // Simulate unexpected disconnection
    mockRos.emit('close');
    expect(reconnectTransport.connectionState$.getValue()).toBe('connecting');

    // Advance timer to trigger reconnect
    vi.advanceTimersByTime(1000);

    // mockRos.connect() was called, emitting 'connection'
    expect(reconnectTransport.connectionState$.getValue()).toBe('connected');

    reconnectTransport.destroy();
  });

  it('stops reconnecting after max attempts exhausted', () => {
    const failRos = new MockRos();
    failRos.connect = () => {
      failRos.emit('error', new Error('refused'));
    };

    const failTransport = new RosTransport({
      robotId: 'robot-fail',
      url: 'ws://localhost:9090',
      rosFactory: () => failRos,
      maxReconnectAttempts: 2,
      baseReconnectIntervalMs: 1000,
      backoffMultiplier: 2,
    });

    failTransport.connect();
    expect(failTransport.connectionState$.getValue()).toBe('error');

    // Simulate close after error (triggers reconnect attempt 1)
    failRos.emit('close');
    vi.advanceTimersByTime(1000);
    expect(failTransport.connectionState$.getValue()).toBe('error');

    // Simulate close after error (triggers reconnect attempt 2)
    failRos.emit('close');
    vi.advanceTimersByTime(2000);
    expect(failTransport.connectionState$.getValue()).toBe('error');

    // No more attempts — should stay in error
    failRos.emit('close');
    vi.advanceTimersByTime(4000);
    expect(failTransport.connectionState$.getValue()).toBe('error');

    failTransport.destroy();
  });

  it('destroy() cleans up and prevents further state changes', () => {
    transport.connect();
    transport.destroy();

    expect(transport.connectionState$.getValue()).toBe('disconnected');
    expect(() => transport.connect()).not.toThrow();
  });

  it('exposes the underlying ros instance via getRos()', () => {
    expect(transport.getRos()).toBe(mockRos);
  });
});
