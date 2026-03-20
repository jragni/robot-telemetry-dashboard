import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { RosServiceRegistry } from './RosServiceRegistry';

import { MockRos } from '@/test/mocks/roslib.mock';

describe('RosServiceRegistry', () => {
  let registry: RosServiceRegistry;

  beforeEach(() => {
    registry = new RosServiceRegistry({
      rosFactory: () => new MockRos(),
    });
  });

  afterEach(() => {
    registry.destroyAll();
  });

  it('get() creates transport on first call', () => {
    const transport = registry.get('robot-1', 'ws://localhost:9090');
    expect(transport).toBeDefined();
    expect(transport.robotId).toBe('robot-1');
  });

  it('get() returns same transport on subsequent calls', () => {
    const transport1 = registry.get('robot-1', 'ws://localhost:9090');
    const transport2 = registry.get('robot-1', 'ws://localhost:9090');
    expect(transport1).toBe(transport2);
  });

  it('get() creates separate transports for different robots', () => {
    const transport1 = registry.get('robot-1', 'ws://localhost:9090');
    const transport2 = registry.get('robot-2', 'ws://localhost:9091');
    expect(transport1).not.toBe(transport2);
    expect(transport1.robotId).toBe('robot-1');
    expect(transport2.robotId).toBe('robot-2');
  });

  it('destroy() removes and cleans up a specific transport', () => {
    const transport = registry.get('robot-1', 'ws://localhost:9090');
    expect(transport).toBeDefined();

    registry.destroy('robot-1');

    // Getting again should create a new instance
    const newTransport = registry.get('robot-1', 'ws://localhost:9090');
    expect(newTransport).not.toBe(transport);
  });

  it('destroyAll() removes all transports', () => {
    registry.get('robot-1', 'ws://localhost:9090');
    registry.get('robot-2', 'ws://localhost:9091');

    registry.destroyAll();

    // Should create new instances
    const t1 = registry.get('robot-1', 'ws://localhost:9090');
    const t2 = registry.get('robot-2', 'ws://localhost:9091');
    expect(t1).toBeDefined();
    expect(t2).toBeDefined();
  });
});
