import { firstValueFrom } from 'rxjs';
import { describe, expect, it, beforeEach } from 'vitest';

import { TopicDiscovery } from './TopicDiscovery';

import { MockRos } from '@/test/mocks/roslib.mock';

describe('TopicDiscovery', () => {
  let mockRos: MockRos;
  let discovery: TopicDiscovery;

  beforeEach(() => {
    mockRos = new MockRos();
    mockRos.isConnected = true;
    discovery = new TopicDiscovery({ ros: mockRos });
  });

  it('getTopics$() returns an Observable', () => {
    const obs$ = discovery.getTopics$();
    expect(obs$).toBeDefined();
    expect(typeof obs$.subscribe).toBe('function');
  });

  it('emits list of available topics from ros instance', async () => {
    const topics = await firstValueFrom(discovery.getTopics$());

    expect(topics).toEqual([
      { name: '/cmd_vel', type: 'geometry_msgs/Twist' },
      { name: '/imu/data', type: 'sensor_msgs/Imu' },
      { name: '/scan', type: 'sensor_msgs/LaserScan' },
    ]);
  });

  it('emits error when not connected', async () => {
    mockRos.isConnected = false;

    await expect(firstValueFrom(discovery.getTopics$())).rejects.toThrow(
      'Not connected'
    );
  });
});
