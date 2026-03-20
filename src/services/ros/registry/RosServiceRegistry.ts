import ROSLIB from 'roslib';

import { RosTransport } from '../transport/RosTransport';

import type { MockRos } from '@/test/mocks/roslib.mock';

export interface RosServiceRegistryOptions {
  rosFactory: () => MockRos;
}

export class RosServiceRegistry {
  private readonly transports = new Map<string, RosTransport>();
  private readonly rosFactory: () => MockRos;

  constructor(options: RosServiceRegistryOptions) {
    this.rosFactory = options.rosFactory;
  }

  get(robotId: string, url?: string): RosTransport {
    const existing = this.transports.get(robotId);
    if (existing) return existing;

    const transport = new RosTransport({
      robotId,
      url: url ?? '',
      rosFactory: this.rosFactory,
    });

    this.transports.set(robotId, transport);
    return transport;
  }

  destroy(robotId: string): void {
    const transport = this.transports.get(robotId);
    if (transport) {
      transport.destroy();
      this.transports.delete(robotId);
    }
  }

  destroyAll(): void {
    for (const transport of this.transports.values()) {
      transport.destroy();
    }
    this.transports.clear();
  }
}

export const rosServiceRegistry = new RosServiceRegistry({
  rosFactory: () => new ROSLIB.Ros({}) as unknown as MockRos,
});
