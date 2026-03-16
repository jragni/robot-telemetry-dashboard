import ROSLIB from 'roslib';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { RosTransport } from './RosTransport';

import { useRosStore } from '@/stores/ros/ros.store';
import { createMockRos, type MockRos } from '@/test/mocks/roslib.mock';
import type { ConnectionState } from '@/types';

// ---------------------------------------------------------------------------
// roslib mock — hoisted so it is in place before all static imports resolve.
// ---------------------------------------------------------------------------

// Always points to the most-recently-created mock instance.
// The mock factory updates this on every `new ROSLIB.Ros()` call so that
// each retry in the implementation gets a distinct object (matching real
// behaviour) while tests can always reference the latest via this variable.
let mockRosInstance: MockRos;

vi.mock('roslib', () => ({
  default: {
    // Must use a regular function (not an arrow) so it can be called with `new`.
    // eslint-disable-next-line prefer-arrow-callback
    Ros: vi.fn(function () {
      // Create a fresh MockRos each time the constructor is invoked and expose
      // it through the shared variable so test assertions can access it.
      mockRosInstance = createMockRos();
      return mockRosInstance;
    }),
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROBOT_ID = 'robot-1';
const BASE_URL = 'ws://localhost:9090';

function getStoreState(robotId: string) {
  return useRosStore.getState().connections[robotId];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RosTransport', () => {
  beforeEach(() => {
    // Reset the Zustand store to a clean slate.
    // mockRosInstance is populated automatically by the vi.mock factory each
    // time `new ROSLIB.Ros()` is called inside the SUT.
    useRosStore.setState({ connections: {} });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  // -------------------------------------------------------------------------
  describe('constructor', () => {
    it('initializes with connectionState "disconnected"', () => {
      const transport = new RosTransport(ROBOT_ID);

      expect(transport.getCurrentState()).toBe('disconnected');
    });
  });

  // -------------------------------------------------------------------------
  describe('connect', () => {
    it('creates ROSLIB.Ros with url + ROSBRIDGE_PATH', async () => {
      const ROSLIB = (await import('roslib')).default;
      const transport = new RosTransport(ROBOT_ID);

      transport.connect(BASE_URL);

      expect(ROSLIB.Ros).toHaveBeenCalledWith({
        url: `${BASE_URL}/rosbridge`,
      });
    });

    it('sets state to "connecting" immediately', () => {
      const transport = new RosTransport(ROBOT_ID);

      transport.connect(BASE_URL);

      expect(transport.getCurrentState()).toBe('connecting');
    });

    it('resets retryCount to 0 on a fresh connect', () => {
      vi.useFakeTimers();
      const transport = new RosTransport(ROBOT_ID);

      // Exhaust retries so retryCount > 0
      transport.connect(BASE_URL);
      mockRosInstance._trigger('error', new Error('fail'));
      vi.advanceTimersByTime(3000);
      mockRosInstance._trigger('error', new Error('fail'));
      vi.advanceTimersByTime(3000);

      // Call connect again — retryCount should reset
      transport.connect(BASE_URL);

      // After a successful reconnect retryCount is 0 — we verify by checking
      // that a subsequent error schedules a retry (retryCount was 0, not at max)
      mockRosInstance._trigger('error', new Error('fail'));

      expect(transport.getCurrentState()).toBe('error');
      // A reconnect timer should have been scheduled (count went 0 -> 1 < 3)
      vi.advanceTimersByTime(3000);
      expect(transport.getCurrentState()).toBe('connecting');
    });
  });

  // -------------------------------------------------------------------------
  describe('connection lifecycle', () => {
    it('sets state to "connected" when ROSLIB emits "connection"', () => {
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);

      mockRosInstance._trigger('connection');

      expect(transport.getCurrentState()).toBe('connected');
    });

    it('calls useRosStore.setConnectionState(robotId, "connected")', () => {
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);

      mockRosInstance._trigger('connection');

      expect(getStoreState(ROBOT_ID)?.connectionState).toBe('connected');
    });

    it('clears the error on successful connection (setConnectionError with null)', () => {
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);

      // Prime the store with an existing error
      useRosStore.getState().setConnectionError(ROBOT_ID, {
        message: 'previous error',
        code: 'ROS_ERROR',
        timestamp: Date.now(),
      });

      mockRosInstance._trigger('connection');

      expect(getStoreState(ROBOT_ID)?.error).toBeNull();
    });

    it('resets retryCount to 0 on connection', () => {
      vi.useFakeTimers();
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);

      // Trigger one error to increment retryCount to 1
      mockRosInstance._trigger('error', new Error('fail'));
      vi.advanceTimersByTime(3000);

      // Now the reconnect fires — simulate successful connection
      mockRosInstance._trigger('connection');

      // Now trigger another error — if retryCount was reset to 0 it will
      // schedule a retry (0 < 3), pushing state to 'error' then 'connecting'
      mockRosInstance._trigger('error', new Error('fail again'));
      expect(transport.getCurrentState()).toBe('error');
      vi.advanceTimersByTime(3000);
      expect(transport.getCurrentState()).toBe('connecting');
    });
  });

  // -------------------------------------------------------------------------
  describe('error handling', () => {
    it('sets state to "error" on ROSLIB "error" event', () => {
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);

      mockRosInstance._trigger('error', new Error('connection refused'));

      expect(transport.getCurrentState()).toBe('error');
    });

    it('calls useRosStore.setConnectionError with a ConnectionError object', () => {
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);

      mockRosInstance._trigger('error', new Error('connection refused'));

      const entry = getStoreState(ROBOT_ID);
      expect(entry?.error).toMatchObject({
        message: expect.any(String) as unknown,
        code: 'ROS_ERROR',
        timestamp: expect.any(Number) as unknown,
      });
    });

    it('schedules a reconnect when retryCount < maxReconnectAttempts', () => {
      vi.useFakeTimers();
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);

      mockRosInstance._trigger('error', new Error('fail'));
      expect(transport.getCurrentState()).toBe('error');

      // After the reconnect interval the transport should try to reconnect
      vi.advanceTimersByTime(3000);
      expect(transport.getCurrentState()).toBe('connecting');
    });

    it('does NOT schedule a reconnect when retryCount >= maxReconnectAttempts', () => {
      vi.useFakeTimers();
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);

      // Exhaust all 3 attempts
      mockRosInstance._trigger('error', new Error('fail 1'));
      vi.advanceTimersByTime(3000);
      mockRosInstance._trigger('error', new Error('fail 2'));
      vi.advanceTimersByTime(3000);
      mockRosInstance._trigger('error', new Error('fail 3'));
      vi.advanceTimersByTime(3000);

      // retryCount is now at max — a 4th error should not schedule another attempt
      const stateAfterMax = transport.getCurrentState();
      vi.advanceTimersByTime(3000);
      expect(transport.getCurrentState()).toBe(stateAfterMax);
      expect(transport.getCurrentState()).not.toBe('connecting');
    });

    it('sets state to "disconnected" after exhausting all retries', () => {
      vi.useFakeTimers();
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);

      // Each error triggers a retry; after max retries state becomes 'disconnected'
      mockRosInstance._trigger('error', new Error('fail 1'));
      vi.advanceTimersByTime(3000);
      mockRosInstance._trigger('error', new Error('fail 2'));
      vi.advanceTimersByTime(3000);
      mockRosInstance._trigger('error', new Error('fail 3'));

      expect(transport.getCurrentState()).toBe('disconnected');
    });
  });

  // -------------------------------------------------------------------------
  describe('close handling', () => {
    it('schedules a reconnect when was previously "connected"', () => {
      vi.useFakeTimers();
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      mockRosInstance._trigger('connection');
      expect(transport.getCurrentState()).toBe('connected');

      mockRosInstance._trigger('close');

      vi.advanceTimersByTime(3000);
      expect(transport.getCurrentState()).toBe('connecting');
    });

    it('does NOT reconnect when destroyed', () => {
      vi.useFakeTimers();
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      mockRosInstance._trigger('connection');

      transport.destroy();
      mockRosInstance._trigger('close');

      vi.advanceTimersByTime(3000);
      // Should remain disconnected, not attempt reconnect
      expect(transport.getCurrentState()).toBe('disconnected');
    });
  });

  // -------------------------------------------------------------------------
  describe('reconnection', () => {
    it('increments retryCount on each retry', () => {
      vi.useFakeTimers();
      const MockedRos = vi.mocked(ROSLIB.Ros);
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);

      const initialCallCount = MockedRos.mock.calls.length;

      mockRosInstance._trigger('error', new Error('fail'));
      vi.advanceTimersByTime(3000);

      mockRosInstance._trigger('error', new Error('fail'));
      vi.advanceTimersByTime(3000);

      // Each retry creates a new Ros instance
      expect(MockedRos.mock.calls.length).toBe(initialCallCount + 2);
    });

    it('waits reconnectInterval ms before reconnecting', () => {
      vi.useFakeTimers();
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);

      mockRosInstance._trigger('error', new Error('fail'));
      expect(transport.getCurrentState()).toBe('error');

      // Not yet — just under the interval
      vi.advanceTimersByTime(2999);
      expect(transport.getCurrentState()).toBe('error');

      // Now it fires
      vi.advanceTimersByTime(1);
      expect(transport.getCurrentState()).toBe('connecting');
    });

    it('stops after maxReconnectAttempts (3)', () => {
      vi.useFakeTimers();
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);

      for (let i = 0; i < 3; i++) {
        mockRosInstance._trigger('error', new Error(`fail ${i + 1}`));
        if (i < 2) {
          vi.advanceTimersByTime(3000);
        }
      }

      // After the 3rd error (no more retries) state is 'disconnected'
      expect(transport.getCurrentState()).toBe('disconnected');

      vi.advanceTimersByTime(3000);
      // Still disconnected — no further attempts
      expect(transport.getCurrentState()).toBe('disconnected');
    });
  });

  // -------------------------------------------------------------------------
  describe('disconnect', () => {
    it('calls ros.close()', () => {
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);

      transport.disconnect();

      expect(mockRosInstance.close).toHaveBeenCalledOnce();
    });

    it('sets state to "disconnected"', () => {
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      mockRosInstance._trigger('connection');

      transport.disconnect();

      expect(transport.getCurrentState()).toBe('disconnected');
    });

    it('clears the retry timer', () => {
      vi.useFakeTimers();
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);

      // Prime a pending retry
      mockRosInstance._trigger('error', new Error('fail'));
      expect(transport.getCurrentState()).toBe('error');

      transport.disconnect();
      vi.advanceTimersByTime(3000);

      // Disconnect should have cleared the timer — no reconnect
      expect(transport.getCurrentState()).toBe('disconnected');
    });

    it('does NOT trigger a reconnect after disconnect', () => {
      vi.useFakeTimers();
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      mockRosInstance._trigger('connection');

      transport.disconnect();

      // Even if ROSLIB fires a close event afterwards, no reconnect
      mockRosInstance._trigger('close');
      vi.advanceTimersByTime(3000);
      expect(transport.getCurrentState()).toBe('disconnected');
    });
  });

  // -------------------------------------------------------------------------
  describe('destroy', () => {
    it('calls ros.close()', () => {
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);

      transport.destroy();

      expect(mockRosInstance.close).toHaveBeenCalledOnce();
    });

    it('completes the connectionState$ observable', () => {
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);

      const completeSpy = vi.fn();
      transport.getConnectionState$().subscribe({ complete: completeSpy });

      transport.destroy();

      expect(completeSpy).toHaveBeenCalledOnce();
    });

    it('prevents further reconnects after destroy', () => {
      vi.useFakeTimers();
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);

      mockRosInstance._trigger('error', new Error('fail'));
      transport.destroy();

      vi.advanceTimersByTime(3000);
      expect(transport.getCurrentState()).toBe('disconnected');
    });

    it('is safe to call multiple times without throwing', () => {
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);

      expect(() => {
        transport.destroy();
        transport.destroy();
        transport.destroy();
      }).not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  describe('getConnectionState$()', () => {
    it('emits the initial "disconnected" state immediately', () => {
      const transport = new RosTransport(ROBOT_ID);
      const emissions: ConnectionState[] = [];

      transport.getConnectionState$().subscribe((s) => emissions.push(s));

      expect(emissions).toEqual(['disconnected']);
    });

    it('emits state transitions in order', () => {
      const transport = new RosTransport(ROBOT_ID);
      const emissions: ConnectionState[] = [];

      transport.getConnectionState$().subscribe((s) => emissions.push(s));

      transport.connect(BASE_URL);
      mockRosInstance._trigger('connection');

      expect(emissions).toEqual(['disconnected', 'connecting', 'connected']);
    });

    it('deduplicates consecutive identical states (distinctUntilChanged)', () => {
      const transport = new RosTransport(ROBOT_ID);
      const emissions: ConnectionState[] = [];

      transport.getConnectionState$().subscribe((s) => emissions.push(s));

      // Force the same state twice in a row by connecting twice from 'disconnected'
      transport.connect(BASE_URL);
      // Manually push 'connecting' again — BehaviorSubject would emit it,
      // but distinctUntilChanged should filter the duplicate.
      // We verify by subscribing after two identical setState calls.
      transport.connect(BASE_URL);

      // Should only contain one 'connecting', not two
      const connectingCount = emissions.filter(
        (s) => s === 'connecting'
      ).length;
      expect(connectingCount).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  describe('getRosInstance()', () => {
    it('returns the ROSLIB.Ros instance when connected', () => {
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      mockRosInstance._trigger('connection');

      const instance = transport.getRosInstance();

      expect(instance).toBe(mockRosInstance);
    });

    it('throws when not connected (state is "disconnected")', () => {
      const transport = new RosTransport(ROBOT_ID);

      expect(() => transport.getRosInstance()).toThrow();
    });

    it('throws when not connected (state is "connecting")', () => {
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);

      expect(() => transport.getRosInstance()).toThrow();
    });

    it('throws when not connected (state is "error")', () => {
      const transport = new RosTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      mockRosInstance._trigger('error', new Error('fail'));

      expect(() => transport.getRosInstance()).toThrow();
    });
  });
});
