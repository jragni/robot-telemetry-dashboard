import { describe, expect, it, vi, beforeEach } from 'vitest';

import { TopicPublisher } from './TopicPublisher';

import type { Twist } from '@/shared/types/ros-messages.types';
import { MockRos, MockTopic } from '@/test/mocks/roslib.mock';

describe('TopicPublisher', () => {
  let mockRos: MockRos;
  let publisher: TopicPublisher;

  beforeEach(() => {
    mockRos = new MockRos();
    mockRos.isConnected = true;
    publisher = new TopicPublisher({
      ros: mockRos,
      topicFactory: (options) => new MockTopic({ ...options, ros: mockRos }),
    });
  });

  it('createTopicPublisher() returns a handle with publish() and dispose()', () => {
    const handle = publisher.createTopicPublisher<Twist>({
      topicName: '/cmd_vel',
      messageType: 'geometry_msgs/Twist',
    });

    expect(handle).toBeDefined();
    expect(typeof handle.publish).toBe('function');
    expect(typeof handle.dispose).toBe('function');

    handle.dispose();
  });

  it('publish() sends message via roslib Topic', () => {
    const handle = publisher.createTopicPublisher<Twist>({
      topicName: '/cmd_vel',
      messageType: 'geometry_msgs/Twist',
    });

    const message: Twist = {
      linear: { x: 1, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: 0.5 },
    };

    const topic = publisher.getActiveTopic('/cmd_vel')!;
    const publishSpy = vi.spyOn(topic, 'publish');

    handle.publish(message);

    expect(publishSpy).toHaveBeenCalledWith(message);

    handle.dispose();
  });

  it('advertises on first publish', () => {
    const handle = publisher.createTopicPublisher<Twist>({
      topicName: '/cmd_vel',
      messageType: 'geometry_msgs/Twist',
    });

    const topic = publisher.getActiveTopic('/cmd_vel')!;
    expect(topic.isAdvertised).toBe(true);

    handle.dispose();
  });

  it('unadvertises on dispose()', () => {
    const handle = publisher.createTopicPublisher<Twist>({
      topicName: '/cmd_vel',
      messageType: 'geometry_msgs/Twist',
    });

    const topic = publisher.getActiveTopic('/cmd_vel')!;

    handle.dispose();
    expect(topic.isAdvertised).toBe(false);
  });
});
