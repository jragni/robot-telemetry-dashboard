import { vi, type Mock } from 'vitest';

type RosEventHandler = (...args: unknown[]) => void;

interface MockRosInstance {
  on: Mock;
  close: Mock;
  url: string;
  _handlers: Record<string, RosEventHandler>;
  _emit: (event: string, ...args: unknown[]) => void;
}

let latestMockRos: MockRosInstance | null = null;

function getMockRos(): MockRosInstance {
  if (!latestMockRos) throw new Error('No mock Ros instance created yet');
  return latestMockRos;
}

vi.mock('roslib', () => {
  class MockRos {
    on: Mock;
    close: Mock;
    url: string;
    _handlers: Record<string, RosEventHandler>;
    _emit: (event: string, ...args: unknown[]) => void;

    constructor(opts: { url: string }) {
      const handlers: Record<string, RosEventHandler> = {};
      this.url = opts.url;
      this._handlers = handlers;
      this.on = vi.fn((event: string, handler: RosEventHandler) => {
        handlers[event] = handler;
      });
      this.close = vi.fn();
      const h = handlers;
      this._emit = (event: string, ...args: unknown[]) => {
        h[event]?.(...args);
      };
      latestMockRos = this as unknown as MockRosInstance;
    }
  }

  return { Ros: MockRos, Topic: vi.fn() };
});

const mockUpdateRobot = vi.fn();
const mockRobots: Record<string, unknown> = {};

vi.mock('@/stores/connection/useConnectionStore', () => ({
  useConnectionStore: {
    getState: () => ({
      robots: mockRobots,
      updateRobot: mockUpdateRobot,
    }),
  },
}));

import { connect, disconnect, getConnection, getConnectedAt, testConnection } from '@/lib/rosbridge/ConnectionManager';

describe('ConnectionManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    latestMockRos = null;
    mockRobots['robot-1'] = {
      id: 'robot-1',
      name: 'TestBot',
      url: 'ws://192.168.1.10',
      status: 'disconnected',
    };
  });

  afterEach(() => {
    try { disconnect('robot-1'); } catch { /* cleanup */ }
  });

  describe('connect', () => {
    it('creates a Ros instance with the derived rosbridge URL', async () => {
      const connectPromise = connect('robot-1', 'ws://192.168.1.10');
      getMockRos()._emit('connection');
      await connectPromise;

      expect(getMockRos().url).toBe('ws://192.168.1.10/rosbridge');
    });

    it('resolves on successful connection', async () => {
      const connectPromise = connect('robot-1', 'ws://192.168.1.10');
      getMockRos()._emit('connection');
      await expect(connectPromise).resolves.toBeUndefined();
    });

    it('updates store to connected on success', async () => {
      const connectPromise = connect('robot-1', 'ws://192.168.1.10');
      getMockRos()._emit('connection');
      await connectPromise;

      expect(mockUpdateRobot).toHaveBeenCalledWith('robot-1', expect.objectContaining({
        status: 'connected',
      }));
    });

    it('rejects on error', async () => {
      const connectPromise = connect('robot-1', 'ws://192.168.1.10');
      getMockRos()._emit('error', new Error('WebSocket failure'));
      await expect(connectPromise).rejects.toThrow('WebSocket failure');
    });

    it('updates store to error on failure', async () => {
      const connectPromise = connect('robot-1', 'ws://192.168.1.10');
      getMockRos()._emit('error', new Error('WebSocket failure'));
      await connectPromise.catch(() => { /* expected rejection */ });

      expect(mockUpdateRobot).toHaveBeenCalledWith('robot-1', expect.objectContaining({
        status: 'error',
        lastError: 'WebSocket failure',
      }));
    });

    it('throws for empty URL', async () => {
      await expect(connect('robot-1', '')).rejects.toThrow('Invalid robot URL');
    });

    it('settled flag prevents duplicate connection events', async () => {
      const connectPromise = connect('robot-1', 'ws://192.168.1.10');
      getMockRos()._emit('connection');
      getMockRos()._emit('connection');
      await connectPromise;

      const connectedCalls = mockUpdateRobot.mock.calls.filter(
        (call: unknown[]) => (call[1] as Record<string, string>).status === 'connected',
      );
      expect(connectedCalls).toHaveLength(1);
    });
  });

  describe('disconnect', () => {
    it('closes the Ros instance', async () => {
      const connectPromise = connect('robot-1', 'ws://192.168.1.10');
      const ros = getMockRos();
      ros._emit('connection');
      await connectPromise;

      disconnect('robot-1');
      expect(ros.close).toHaveBeenCalled();
    });

    it('updates store to disconnected', async () => {
      const connectPromise = connect('robot-1', 'ws://192.168.1.10');
      getMockRos()._emit('connection');
      await connectPromise;

      disconnect('robot-1');

      expect(mockUpdateRobot).toHaveBeenCalledWith('robot-1', expect.objectContaining({
        status: 'disconnected',
      }));
    });

    it('blocks auto-reconnect after intentional disconnect', async () => {
      const connectPromise = connect('robot-1', 'ws://192.168.1.10');
      const ros = getMockRos();
      ros._emit('connection');
      await connectPromise;

      disconnect('robot-1');
      ros._emit('close');

      const connectingCalls = mockUpdateRobot.mock.calls.filter(
        (call: unknown[]) => (call[1] as Record<string, string>).status === 'connecting',
      );
      expect(connectingCalls).toHaveLength(1);
    });
  });

  describe('getConnection', () => {
    it('returns undefined when not connected', () => {
      expect(getConnection('nonexistent')).toBeUndefined();
    });

    it('returns Ros instance after connecting', async () => {
      const connectPromise = connect('robot-1', 'ws://192.168.1.10');
      getMockRos()._emit('connection');
      await connectPromise;

      expect(getConnection('robot-1')).toBeDefined();
    });
  });

  describe('getConnectedAt', () => {
    it('returns null when not connected', () => {
      expect(getConnectedAt('nonexistent')).toBeNull();
    });

    it('returns a timestamp after connecting', async () => {
      const before = Date.now();
      const connectPromise = connect('robot-1', 'ws://192.168.1.10');
      getMockRos()._emit('connection');
      await connectPromise;

      const connectedAt = getConnectedAt('robot-1');
      expect(connectedAt).not.toBeNull();
      expect(connectedAt ?? 0).toBeGreaterThanOrEqual(before);
    });
  });

  describe('testConnection', () => {
    it('resolves on successful test', async () => {
      const testPromise = testConnection('ws://192.168.1.10');
      getMockRos()._emit('connection');
      await expect(testPromise).resolves.toBeUndefined();
    });

    it('cleans up after successful test', async () => {
      const testPromise = testConnection('ws://192.168.1.10');
      const ros = getMockRos();
      ros._emit('connection');
      await testPromise;
      expect(ros.close).toHaveBeenCalled();
    });

    it('rejects on error', async () => {
      const testPromise = testConnection('ws://192.168.1.10');
      getMockRos()._emit('error', new Error('refused'));
      await expect(testPromise).rejects.toThrow();
    });

    it('throws for empty URL', async () => {
      await expect(testConnection('')).rejects.toThrow('Invalid robot URL');
    });
  });
});
