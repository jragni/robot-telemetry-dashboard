import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { WebRTCServiceRegistry } from './WebRTCServiceRegistry';

import { useConnectionsStore } from '@/stores/connections/connections.store';
import { useWebRTCStore } from '@/stores/webrtc.store';

// ---------------------------------------------------------------------------
// WebRTCTransport mock — hoisted so it is in place before all static imports.
// ---------------------------------------------------------------------------

const mockTransport = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  destroy: vi.fn(),
  getCurrentState: vi.fn().mockReturnValue('disconnected'),
  getConnectionState$: vi.fn(),
  getMediaStream$: vi.fn(),
};

vi.mock('./WebRTCTransport', () => ({
  // eslint-disable-next-line prefer-arrow-callback
  WebRTCTransport: vi.fn(function () {
    return mockTransport;
  }),
}));

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROBOT_ID = 'robot-1';
const BASE_URL = 'http://localhost:8080';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('WebRTCServiceRegistry', () => {
  let registry: WebRTCServiceRegistry;

  beforeEach(() => {
    useWebRTCStore.setState({ connections: {} });
    useConnectionsStore.setState({ robots: [], activeRobotId: null });
    // Reset all mock functions before each test
    mockTransport.connect.mockReset();
    mockTransport.disconnect.mockReset();
    mockTransport.destroy.mockReset();
    mockTransport.getCurrentState.mockReturnValue('disconnected');
    registry = new WebRTCServiceRegistry();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  describe('connect', () => {
    it('creates a WebRTCTransport for the robotId', () => {
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

    it('calling connect twice for same robotId does not create second transport (idempotent)', async () => {
      const { WebRTCTransport } = await import('./WebRTCTransport');
      const MockedTransport = vi.mocked(WebRTCTransport);

      registry.connect(ROBOT_ID, BASE_URL);
      const callsAfterFirst = MockedTransport.mock.calls.length;

      registry.connect(ROBOT_ID, BASE_URL);
      expect(MockedTransport.mock.calls.length).toBe(callsAfterFirst);
    });

    it('calls transport.connect with the baseUrl', () => {
      registry.connect(ROBOT_ID, BASE_URL);

      expect(mockTransport.connect).toHaveBeenCalledWith(BASE_URL);
    });
  });

  // -------------------------------------------------------------------------
  describe('disconnect', () => {
    it('calls transport.disconnect()', () => {
      registry.connect(ROBOT_ID, BASE_URL);

      registry.disconnect(ROBOT_ID);

      expect(mockTransport.disconnect).toHaveBeenCalledOnce();
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

      registry.remove(ROBOT_ID);

      expect(mockTransport.destroy).toHaveBeenCalledOnce();
    });

    it('removes transport from internal map', () => {
      registry.connect(ROBOT_ID, BASE_URL);

      registry.remove(ROBOT_ID);

      expect(() => registry.getTransport(ROBOT_ID)).toThrow();
    });

    it('calls useWebRTCStore.removeConnection(robotId)', () => {
      registry.connect(ROBOT_ID, BASE_URL);
      // Seed store state to confirm removal
      useWebRTCStore.getState().setConnectionState(ROBOT_ID, 'connected');
      expect(useWebRTCStore.getState().connections[ROBOT_ID]).toBeDefined();

      registry.remove(ROBOT_ID);

      expect(useWebRTCStore.getState().connections[ROBOT_ID]).toBeUndefined();
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
      mockTransport.getCurrentState.mockReturnValue('connected');
      registry.connect(ROBOT_ID, BASE_URL);

      expect(registry.isConnected(ROBOT_ID)).toBe(true);
    });

    it('returns false when no transport exists', () => {
      expect(registry.isConnected('no-such-robot')).toBe(false);
    });

    it('returns false when transport state is not "connected"', () => {
      mockTransport.getCurrentState.mockReturnValue('connecting');
      registry.connect(ROBOT_ID, BASE_URL);

      expect(registry.isConnected(ROBOT_ID)).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  describe('destroyAll', () => {
    it('destroys all transports', () => {
      // We need separate mock instances to spy on each independently.
      // Re-import and re-configure per connect call by tracking call order.
      const destroySpy = mockTransport.destroy;
      destroySpy.mockReset();

      registry.connect(ROBOT_ID, BASE_URL);
      registry.connect('robot-2', BASE_URL);

      registry.destroyAll();

      // destroy() should have been called twice — once per transport.
      // Since the mock factory always returns the same object, both registry
      // entries point to mockTransport and destroy is called for each.
      expect(destroySpy).toHaveBeenCalledTimes(2);
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
