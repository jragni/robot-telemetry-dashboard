import { vi } from 'vitest';

/**
 * Mock ROSLIB.Ros — captures event handlers for manual triggering in tests.
 */
export interface MockRos {
  on: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  connect: ReturnType<typeof vi.fn>;
  isConnected: boolean;
  getTopics: ReturnType<typeof vi.fn>;
  _trigger: (event: 'connection' | 'error' | 'close', data?: unknown) => void;
  _handlers: Record<string, ((data?: unknown) => void)[]>;
}

export function createMockRos(): MockRos {
  const handlers: Record<string, ((data?: unknown) => void)[]> = {};
  return {
    on: vi.fn((event: string, cb: (data?: unknown) => void) => {
      if (!handlers[event]) handlers[event] = [];
      handlers[event].push(cb);
    }),
    close: vi.fn(),
    connect: vi.fn(),
    isConnected: false,
    getTopics: vi.fn(),
    _handlers: handlers,
    _trigger(event, data?) {
      handlers[event]?.forEach((cb) => cb(data));
    },
  };
}

/**
 * Mock ROSLIB.Topic — captures subscribe callback for manual message emission.
 */
export interface MockTopic {
  subscribe: ReturnType<typeof vi.fn>;
  unsubscribe: ReturnType<typeof vi.fn>;
  publish: ReturnType<typeof vi.fn>;
  advertise: ReturnType<typeof vi.fn>;
  unadvertise: ReturnType<typeof vi.fn>;
  name: string;
  _emit: (msg: unknown) => void;
  _callback: ((msg: unknown) => void) | null;
}

export function createMockTopic(name = '/test'): MockTopic {
  let cb: ((msg: unknown) => void) | null = null;
  return {
    subscribe: vi.fn((handler: (msg: unknown) => void) => {
      cb = handler;
    }),
    unsubscribe: vi.fn(() => {
      cb = null;
    }),
    publish: vi.fn(),
    advertise: vi.fn(),
    unadvertise: vi.fn(),
    name,
    _emit(msg) {
      cb?.(msg);
    },
    get _callback() {
      return cb;
    },
  };
}

/**
 * Mock ROSLIB.Message — pass-through wrapper.
 */
export const MockMessage = vi.fn((data: unknown) => data);
