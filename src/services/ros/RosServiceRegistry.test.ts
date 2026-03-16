import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { RosServiceRegistry } from './RosServiceRegistry';

import { useConnectionsStore } from '@/stores/connections/connections.store';
import { useRosStore } from '@/stores/ros/ros.store';
import { createMockRos, type MockRos } from '@/test/mocks/roslib.mock';

// ---------------------------------------------------------------------------
// roslib mock — hoisted so it is in place before all static imports resolve.
// ---------------------------------------------------------------------------

let mockRosInstance: MockRos;

vi.mock('roslib', () => ({
  default: {
    // eslint-disable-next-line prefer-arrow-callback
    Ros: vi.fn(function () {
      mockRosInstance = createMockRos();
      return mockRosInstance;
    }),
    // eslint-disable-next-line prefer-arrow-callback
    Topic: vi.fn(function () {
      return { subscribe: vi.fn(), unsubscribe: vi.fn() };
    }),
  },
}));

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROBOT_ID = 'robot-1';
const BASE_URL = 'ws://localhost:9090';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RosServiceRegistry', () => {
  let registry: RosServiceRegistry;

  beforeEach(() => {
    useRosStore.setState({ connections: {}, topics: {} });
    useConnectionsStore.setState({ robots: [], activeRobotId: null });
    registry = new RosServiceRegistry();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  describe('connect', () => {
    it('creates a RosTransport for the robotId', () => {
      registry.connect(ROBOT_ID, BASE_URL);

      expect(registry.getTransport(ROBOT_ID)).toBeDefined();
    });

    it('stores transport internally (getTransport returns it)', () => {
      registry.connect(ROBOT_ID, BASE_URL);

      const transport = registry.getTransport(ROBOT_ID);
      expect(transport).toBeDefined();
      // Calling again returns the same instance
      expect(registry.getTransport(ROBOT_ID)).toBe(transport);
    });

    it('calling connect twice for same robotId does not create second transport', async () => {
      const ROSLIB = (await import('roslib')).default;
      const MockedRos = vi.mocked(ROSLIB.Ros);

      registry.connect(ROBOT_ID, BASE_URL);
      const callsAfterFirst = MockedRos.mock.calls.length;

      registry.connect(ROBOT_ID, BASE_URL);
      expect(MockedRos.mock.calls.length).toBe(callsAfterFirst);
    });

    it('calls transport.connect with the baseUrl', () => {
      registry.connect(ROBOT_ID, BASE_URL);

      // After connect the transport should be in 'connecting' state,
      // confirming that transport.connect(baseUrl) was called internally.
      expect(registry.getTransport(ROBOT_ID).getCurrentState()).toBe(
        'connecting'
      );
    });
  });

  // -------------------------------------------------------------------------
  describe('disconnect', () => {
    it('calls transport.disconnect()', () => {
      registry.connect(ROBOT_ID, BASE_URL);
      mockRosInstance._trigger('connection');

      const transport = registry.getTransport(ROBOT_ID);
      const disconnectSpy = vi.spyOn(transport, 'disconnect');

      registry.disconnect(ROBOT_ID);

      expect(disconnectSpy).toHaveBeenCalledOnce();
    });

    it('does not remove transport from registry (can reconnect)', () => {
      registry.connect(ROBOT_ID, BASE_URL);

      registry.disconnect(ROBOT_ID);

      expect(registry.getTransport(ROBOT_ID)).toBeDefined();
    });

    it('is a no-op for unknown robotId', () => {
      expect(() => registry.disconnect('unknown-robot')).not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  describe('remove', () => {
    it('calls transport.destroy()', () => {
      registry.connect(ROBOT_ID, BASE_URL);

      const transport = registry.getTransport(ROBOT_ID);
      const destroySpy = vi.spyOn(transport, 'destroy');

      registry.remove(ROBOT_ID);

      expect(destroySpy).toHaveBeenCalledOnce();
    });

    it('removes transport from internal map', () => {
      registry.connect(ROBOT_ID, BASE_URL);

      registry.remove(ROBOT_ID);

      expect(() => registry.getTransport(ROBOT_ID)).toThrow();
    });

    it('calls useRosStore.removeConnection(robotId)', () => {
      registry.connect(ROBOT_ID, BASE_URL);
      mockRosInstance._trigger('connection');
      // The store should have an entry for ROBOT_ID now
      expect(useRosStore.getState().connections[ROBOT_ID]).toBeDefined();

      registry.remove(ROBOT_ID);

      expect(useRosStore.getState().connections[ROBOT_ID]).toBeUndefined();
    });

    it('getTransport throws after remove', () => {
      registry.connect(ROBOT_ID, BASE_URL);

      registry.remove(ROBOT_ID);

      expect(() => registry.getTransport(ROBOT_ID)).toThrow();
    });
  });

  // -------------------------------------------------------------------------
  describe('getTransport', () => {
    it('returns transport for connected robot', () => {
      registry.connect(ROBOT_ID, BASE_URL);

      expect(registry.getTransport(ROBOT_ID)).toBeDefined();
    });

    it('throws descriptive error for unknown robotId', () => {
      expect(() => registry.getTransport('no-such-robot')).toThrowError(
        /no-such-robot/
      );
    });
  });

  // -------------------------------------------------------------------------
  describe('isConnected', () => {
    it('returns true when transport state is "connected"', () => {
      registry.connect(ROBOT_ID, BASE_URL);
      mockRosInstance._trigger('connection');

      expect(registry.isConnected(ROBOT_ID)).toBe(true);
    });

    it('returns false when no transport exists', () => {
      expect(registry.isConnected('no-such-robot')).toBe(false);
    });

    it('returns false when transport state is not "connected"', () => {
      registry.connect(ROBOT_ID, BASE_URL);
      // State is 'connecting' at this point, not 'connected'

      expect(registry.isConnected(ROBOT_ID)).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  describe('destroyAll', () => {
    it('destroys all transports', () => {
      registry.connect(ROBOT_ID, BASE_URL);
      registry.connect('robot-2', BASE_URL);

      const transport1 = registry.getTransport(ROBOT_ID);
      const transport2 = registry.getTransport('robot-2');
      const destroy1 = vi.spyOn(transport1, 'destroy');
      const destroy2 = vi.spyOn(transport2, 'destroy');

      registry.destroyAll();

      expect(destroy1).toHaveBeenCalledOnce();
      expect(destroy2).toHaveBeenCalledOnce();
    });

    it('clears internal map', () => {
      registry.connect(ROBOT_ID, BASE_URL);
      registry.connect('robot-2', BASE_URL);

      registry.destroyAll();

      expect(() => registry.getTransport(ROBOT_ID)).toThrow();
      expect(() => registry.getTransport('robot-2')).toThrow();
    });
  });
});
