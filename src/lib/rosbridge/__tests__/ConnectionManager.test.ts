import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { RECONNECT_MAX_ATTEMPTS } from '@/constants/reconnection';

type RosEventHandler = (...args: unknown[]) => void;

const { MockRos, mockRosInstances, mockRobots, mockUpdateRobot } = vi.hoisted(() => {
  class MockRosClass {
    url: string;
    close = vi.fn();
    private listeners = new Map<string, RosEventHandler[]>();

    constructor({ url }: { url: string }) {
      this.url = url;
      instances.push(this);
    }

    on(event: string, listener: RosEventHandler): this {
      const list = this.listeners.get(event) ?? [];
      list.push(listener);
      this.listeners.set(event, list);
      return this;
    }

    emit(event: string, ...args: unknown[]): boolean {
      const list = this.listeners.get(event);
      if (!list) return false;
      for (const fn of list) fn(...args);
      return true;
    }
  }

  const instances: MockRosClass[] = [];
  const robots: Record<string, Record<string, unknown>> = {};
  const updateRobot = vi.fn((id: string, patch: Record<string, unknown>) => {
    const existing = robots[id];
    if (existing) {
      Object.assign(existing, patch);
    }
  });

  return {
    MockRos: MockRosClass,
    mockRobots: robots,
    mockRosInstances: instances,
    mockUpdateRobot: updateRobot,
  };
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

import { ConnectionManager } from '../ConnectionManager';

function seedRobot(id: string, status = 'disconnected') {
  mockRobots[id] = { id, status };
}

function clearRobots() {
  for (const key of Object.keys(mockRobots)) {
    Reflect.deleteProperty(mockRobots, key);
  }
}

function latestRos(): InstanceType<typeof MockRos> {
  const last = mockRosInstances[mockRosInstances.length - 1];
  if (!last) throw new Error('No MockRos instances');
  return last;
}

describe('ConnectionManager', () => {
  let cm: ConnectionManager;

  beforeEach(() => {
    vi.useFakeTimers();
    cm = new ConnectionManager();
    mockRosInstances.length = 0;
    clearRobots();
    mockUpdateRobot.mockClear();
  });

  afterEach(() => {
    cm.reset();
    vi.useRealTimers();
  });

  describe('connect', () => {
    it('resolves when Ros emits connection event', async () => {
      seedRobot('r1');
      const promise = cm.connect('r1', 'http://robot.local');
      latestRos().emit('connection');
      await expect(promise).resolves.toBeUndefined();
    });

    it('rejects on connection timeout', async () => {
      seedRobot('r1');
      const promise = cm.connect('r1', 'http://robot.local');
      vi.advanceTimersByTime(10_000);
      await expect(promise).rejects.toThrow('Connection timed out');
      expect(latestRos().close).toHaveBeenCalled();
    });

    it('rejects when Ros emits error', async () => {
      seedRobot('r1');
      const promise = cm.connect('r1', 'http://robot.local');
      latestRos().emit('error', new Error('ECONNREFUSED'));
      await expect(promise).rejects.toThrow('ECONNREFUSED');
    });

    it('rejects when Ros emits close before connection', async () => {
      seedRobot('r1');
      const promise = cm.connect('r1', 'http://robot.local');
      latestRos().emit('close');
      await expect(promise).rejects.toThrow('Connection closed');
    });

    it('throws for invalid URL', async () => {
      seedRobot('r1');
      await expect(cm.connect('r1', '')).rejects.toThrow('Invalid robot URL');
    });

    it('updates store status to connecting then connected', async () => {
      seedRobot('r1');
      const promise = cm.connect('r1', 'http://robot.local');
      expect(mockUpdateRobot).toHaveBeenCalledWith('r1', expect.objectContaining({ status: 'connecting' }));
      latestRos().emit('connection');
      await promise;
      expect(mockUpdateRobot).toHaveBeenCalledWith('r1', expect.objectContaining({ status: 'connected' }));
    });
  });

  describe('disconnect', () => {
    it('calls Ros.close()', async () => {
      seedRobot('r1');
      const promise = cm.connect('r1', 'http://robot.local');
      const ros = latestRos();
      ros.emit('connection');
      await promise;
      cm.disconnect('r1');
      expect(ros.close).toHaveBeenCalled();
    });

    it('prevents auto-reconnect after intentional disconnect', async () => {
      seedRobot('r1');
      const promise = cm.connect('r1', 'http://robot.local');
      const ros = latestRos();
      ros.emit('connection');
      await promise;
      cm.disconnect('r1');
      ros.emit('close');
      vi.advanceTimersByTime(60_000);
      expect(mockRosInstances).toHaveLength(1);
    });
  });

  describe('reconnection', () => {
    const noop = () => { /* noop */ };

    beforeEach(() => {
      process.on('unhandledRejection', noop);
    });

    afterEach(() => {
      process.removeListener('unhandledRejection', noop);
    });

    it('schedules reconnect after involuntary close', async () => {
      seedRobot('r1');
      const promise = cm.connect('r1', 'http://robot.local');
      const ros = latestRos();
      ros.emit('connection');
      await promise;
      ros.emit('close');
      vi.advanceTimersByTime(3_000);
      expect(mockRosInstances.length).toBeGreaterThan(1);
    });

    it('writes reconnectAttempt to the store on each retry', async () => {
      seedRobot('r1');
      const promise = cm.connect('r1', 'http://robot.local');
      const ros = latestRos();
      ros.emit('connection');
      await promise;
      ros.emit('close');

      expect(mockUpdateRobot).toHaveBeenCalledWith(
        'r1',
        expect.objectContaining({ reconnectAttempt: 1, status: 'connecting' }),
      );

      await vi.advanceTimersByTimeAsync(3_000);
      latestRos().emit('error', new Error('refused'));
      await vi.advanceTimersByTimeAsync(0);

      expect(mockUpdateRobot).toHaveBeenCalledWith(
        'r1',
        expect.objectContaining({ reconnectAttempt: 2, status: 'connecting' }),
      );
    });

    it('clears reconnectAttempt on successful reconnect', async () => {
      seedRobot('r1');
      const promise = cm.connect('r1', 'http://robot.local');
      const ros = latestRos();
      ros.emit('connection');
      await promise;
      ros.emit('close');
      await vi.advanceTimersByTimeAsync(3_000);
      latestRos().emit('connection');
      await vi.advanceTimersByTimeAsync(0);

      expect(mockUpdateRobot).toHaveBeenCalledWith(
        'r1',
        expect.objectContaining({ reconnectAttempt: null, status: 'connected' }),
      );
    });

    it('clears reconnectAttempt after max attempts failure', async () => {
      seedRobot('r1');
      const promise = cm.connect('r1', 'http://robot.local');
      const ros = latestRos();
      ros.emit('connection');
      await promise;
      ros.emit('close');

      for (let i = 0; i < RECONNECT_MAX_ATTEMPTS + 1; i++) {
        await vi.advanceTimersByTimeAsync(60_000);
        latestRos().emit('error', new Error('refused'));
        await vi.advanceTimersByTimeAsync(0);
      }

      expect(mockUpdateRobot).toHaveBeenCalledWith(
        'r1',
        expect.objectContaining({ reconnectAttempt: null, status: 'error' }),
      );
    });

    it('transitions to error after max reconnect attempts', async () => {
      seedRobot('r1');
      const promise = cm.connect('r1', 'http://robot.local');
      const ros = latestRos();
      ros.emit('connection');
      await promise;
      ros.emit('close');

      for (let i = 0; i < RECONNECT_MAX_ATTEMPTS + 1; i++) {
        await vi.advanceTimersByTimeAsync(60_000);
        latestRos().emit('error', new Error('refused'));
        await vi.advanceTimersByTimeAsync(0);
      }

      expect(mockUpdateRobot).toHaveBeenCalledWith(
        'r1',
        expect.objectContaining({
          lastError: expect.stringContaining(`Failed after ${String(RECONNECT_MAX_ATTEMPTS)} attempts`) as string,
          status: 'error',
        }),
      );
    });
  });

  describe('testConnection', () => {
    it('resolves when Ros emits connection', async () => {
      const promise = cm.testConnection('http://robot.local');
      const ros = latestRos();
      ros.emit('connection');
      await expect(promise).resolves.toBeUndefined();
      expect(ros.close).toHaveBeenCalled();
    });

    it('rejects on timeout', async () => {
      const promise = cm.testConnection('http://robot.local', 5000);
      vi.advanceTimersByTime(5_000);
      await expect(promise).rejects.toThrow('Connection timed out');
    });

    it('rejects on error event', async () => {
      const promise = cm.testConnection('http://robot.local');
      latestRos().emit('error', new Error('ECONNREFUSED'));
      await expect(promise).rejects.toThrow('ECONNREFUSED');
    });

    it('rejects on unexpected close', async () => {
      const promise = cm.testConnection('http://robot.local');
      latestRos().emit('close');
      await expect(promise).rejects.toThrow('Connection closed unexpectedly');
    });

    it('throws for invalid URL', async () => {
      await expect(cm.testConnection('')).rejects.toThrow('Invalid robot URL');
    });
  });

  describe('getConnection / getConnectedAt', () => {
    it('returns Ros instance after successful connect', async () => {
      seedRobot('r1');
      const promise = cm.connect('r1', 'http://robot.local');
      const ros = latestRos();
      ros.emit('connection');
      await promise;
      expect(cm.getConnection('r1')).toBe(ros);
    });

    it('returns undefined for unknown id', () => {
      expect(cm.getConnection('nonexistent')).toBeUndefined();
    });

    it('returns timestamp after successful connect', async () => {
      seedRobot('r1');
      vi.setSystemTime(new Date('2026-04-03T12:00:00Z'));
      const promise = cm.connect('r1', 'http://robot.local');
      latestRos().emit('connection');
      await promise;
      expect(cm.getConnectedAt('r1')).toBe(Date.now());
    });

    it('returns null for disconnected id', () => {
      expect(cm.getConnectedAt('nonexistent')).toBeNull();
    });
  });

  describe('reset', () => {
    it('clears all internal state', async () => {
      seedRobot('r1');
      const promise = cm.connect('r1', 'http://robot.local');
      latestRos().emit('connection');
      await promise;

      cm.reset();

      expect(cm.getConnection('r1')).toBeUndefined();
      expect(cm.getConnectedAt('r1')).toBeNull();
    });
  });
});
