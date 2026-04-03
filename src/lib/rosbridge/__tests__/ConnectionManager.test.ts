import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from 'events';

import { RECONNECT_MAX_ATTEMPTS } from '@/constants/reconnection';

type RosEventHandler = (...args: unknown[]) => void;

let mockRosInstances: MockRos[] = [];

class MockRos extends EventEmitter {
  url: string;
  close = vi.fn();

  constructor({ url }: { url: string }) {
    super();
    this.url = url;
    mockRosInstances.push(this);
  }

  override on(event: string, listener: RosEventHandler): this {
    return super.on(event, listener);
  }
}

const mockRobots: Record<string, Record<string, unknown>> = {};
const mockUpdateRobot = vi.fn((id: string, patch: Record<string, unknown>) => {
  const existing = mockRobots[id];
  if (existing) {
    Object.assign(existing, patch);
  }
});

vi.mock('roslib', () => ({
  Ros: MockRos,
}));

vi.mock('@/stores/connection/useConnectionStore', () => ({
  useConnectionStore: {
    getState: () => ({
      robots: mockRobots,
      updateRobot: mockUpdateRobot,
    }),
  },
}));

vi.mock('@/stores/connection/useConnectionStore.helpers', () => ({
  deriveRosbridgeUrl: (url: string) => (url ? `${url}/rosbridge` : ''),
}));

function seedRobot(id: string, status = 'disconnected') {
  mockRobots[id] = { id, status };
}

function clearState() {
  for (const key of Object.keys(mockRobots)) {
    delete mockRobots[key];
  }
  mockRosInstances = [];
  mockUpdateRobot.mockClear();
}

function latestRos(): MockRos {
  return mockRosInstances[mockRosInstances.length - 1]!;
}

// Each test group uses importFresh to get clean module-scoped Maps
async function importFresh() {
  vi.resetModules();
  vi.doMock('roslib', () => ({ Ros: MockRos }));
  vi.doMock('@/stores/connection/useConnectionStore', () => ({
    useConnectionStore: {
      getState: () => ({
        robots: mockRobots,
        updateRobot: mockUpdateRobot,
      }),
    },
  }));
  vi.doMock('@/stores/connection/useConnectionStore.helpers', () => ({
    deriveRosbridgeUrl: (url: string) => (url ? `${url}/rosbridge` : ''),
  }));
  return import('../ConnectionManager');
}

describe('ConnectionManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearState();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('connect', () => {
    it('resolves when Ros emits connection event', async () => {
      const { connect } = await importFresh();
      seedRobot('r1');

      const promise = connect('r1', 'http://robot.local');
      latestRos().emit('connection');

      await expect(promise).resolves.toBeUndefined();
    });

    it('rejects on connection timeout', async () => {
      const { connect } = await importFresh();
      seedRobot('r1');

      const promise = connect('r1', 'http://robot.local');

      vi.advanceTimersByTime(10_000);

      await expect(promise).rejects.toThrow('Connection timed out');
      expect(latestRos().close).toHaveBeenCalled();
    });

    it('rejects when Ros emits error', async () => {
      const { connect } = await importFresh();
      seedRobot('r1');

      const promise = connect('r1', 'http://robot.local');
      latestRos().emit('error', new Error('ECONNREFUSED'));

      await expect(promise).rejects.toThrow('ECONNREFUSED');
    });

    it('rejects when Ros emits close before connection', async () => {
      const { connect } = await importFresh();
      seedRobot('r1');

      const promise = connect('r1', 'http://robot.local');
      latestRos().emit('close');

      await expect(promise).rejects.toThrow('Connection closed');
    });

    it('throws for invalid URL', async () => {
      const { connect } = await importFresh();
      seedRobot('r1');

      await expect(connect('r1', '')).rejects.toThrow('Invalid robot URL');
    });

    it('updates store status to connecting then connected', async () => {
      const { connect } = await importFresh();
      seedRobot('r1');

      const promise = connect('r1', 'http://robot.local');

      expect(mockUpdateRobot).toHaveBeenCalledWith('r1', expect.objectContaining({ status: 'connecting' }));

      latestRos().emit('connection');
      await promise;

      expect(mockUpdateRobot).toHaveBeenCalledWith('r1', expect.objectContaining({ status: 'connected' }));
    });
  });

  describe('disconnect', () => {
    it('calls Ros.close()', async () => {
      const { connect, disconnect } = await importFresh();
      seedRobot('r1');

      const promise = connect('r1', 'http://robot.local');
      const ros = latestRos();
      ros.emit('connection');
      await promise;

      disconnect('r1');
      expect(ros.close).toHaveBeenCalled();
    });

    it('prevents auto-reconnect after intentional disconnect', async () => {
      const { connect, disconnect } = await importFresh();
      seedRobot('r1');

      const promise = connect('r1', 'http://robot.local');
      const ros = latestRos();
      ros.emit('connection');
      await promise;

      disconnect('r1');

      // Close fires after disconnect — should NOT trigger reconnect
      ros.emit('close');
      vi.advanceTimersByTime(60_000);

      // Only the original Ros instance — no reconnect spawned
      expect(mockRosInstances).toHaveLength(1);
    });
  });

  describe('reconnection', () => {
    // Reconnect cycles fire `void connect()` internally, producing
    // unhandled rejections. Suppress them so they don't fail the suite.
    const noop = () => {};

    beforeEach(() => {
      process.on('unhandledRejection', noop);
    });

    afterEach(() => {
      process.removeListener('unhandledRejection', noop);
    });

    it('schedules reconnect after involuntary close', async () => {
      const { connect } = await importFresh();
      seedRobot('r1');

      const promise = connect('r1', 'http://robot.local');
      const ros = latestRos();
      ros.emit('connection');
      await promise;

      // Involuntary close (network drop)
      ros.emit('close');

      // Advance past base backoff (2000ms)
      vi.advanceTimersByTime(3_000);

      expect(mockRosInstances.length).toBeGreaterThan(1);
    });

    it('transitions to error after max reconnect attempts', async () => {
      const { connect } = await importFresh();
      seedRobot('r1');

      const promise = connect('r1', 'http://robot.local');
      const ros = latestRos();
      ros.emit('connection');
      await promise;

      // Involuntary close triggers reconnect cycle
      ros.emit('close');

      for (let i = 0; i < RECONNECT_MAX_ATTEMPTS + 1; i++) {
        // Advance past backoff delay
        await vi.advanceTimersByTimeAsync(60_000);

        const current = latestRos();
        // Fail each reconnect attempt with an error
        current.emit('error', new Error('refused'));

        // Let microtasks resolve
        await vi.advanceTimersByTimeAsync(0);
      }

      expect(mockUpdateRobot).toHaveBeenCalledWith(
        'r1',
        expect.objectContaining({
          lastError: expect.stringContaining(`Failed after ${String(RECONNECT_MAX_ATTEMPTS)} attempts`),
          status: 'error',
        }),
      );
    });
  });

  describe('testConnection', () => {
    it('resolves when Ros emits connection', async () => {
      const { testConnection } = await importFresh();

      const promise = testConnection('http://robot.local');
      const ros = latestRos();
      ros.emit('connection');

      await expect(promise).resolves.toBeUndefined();
      expect(ros.close).toHaveBeenCalled();
    });

    it('rejects on timeout', async () => {
      const { testConnection } = await importFresh();

      const promise = testConnection('http://robot.local', 5000);
      vi.advanceTimersByTime(5_000);

      await expect(promise).rejects.toThrow('Connection timed out');
    });

    it('rejects on error event', async () => {
      const { testConnection } = await importFresh();

      const promise = testConnection('http://robot.local');
      latestRos().emit('error', new Error('ECONNREFUSED'));

      await expect(promise).rejects.toThrow('ECONNREFUSED');
    });

    it('rejects on unexpected close', async () => {
      const { testConnection } = await importFresh();

      const promise = testConnection('http://robot.local');
      latestRos().emit('close');

      await expect(promise).rejects.toThrow('Connection closed unexpectedly');
    });

    it('throws for invalid URL', async () => {
      const { testConnection } = await importFresh();

      await expect(testConnection('')).rejects.toThrow('Invalid robot URL');
    });
  });

  describe('getConnection / getConnectedAt', () => {
    it('returns Ros instance after successful connect', async () => {
      const { connect, getConnection } = await importFresh();
      seedRobot('r1');

      const promise = connect('r1', 'http://robot.local');
      const ros = latestRos();
      ros.emit('connection');
      await promise;

      expect(getConnection('r1')).toBe(ros);
    });

    it('returns undefined for unknown id', async () => {
      const { getConnection } = await importFresh();
      expect(getConnection('nonexistent')).toBeUndefined();
    });

    it('returns timestamp after successful connect', async () => {
      const { connect, getConnectedAt } = await importFresh();
      seedRobot('r1');

      vi.setSystemTime(new Date('2026-04-03T12:00:00Z'));

      const promise = connect('r1', 'http://robot.local');
      latestRos().emit('connection');
      await promise;

      expect(getConnectedAt('r1')).toBe(Date.now());
    });

    it('returns null for disconnected id', async () => {
      const { getConnectedAt } = await importFresh();
      expect(getConnectedAt('nonexistent')).toBeNull();
    });
  });
});
