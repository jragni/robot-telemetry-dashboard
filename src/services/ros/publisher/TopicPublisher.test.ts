import type ROSLIB from 'roslib';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createMockTopic, type MockTopic } from '@/test/mocks/roslib.mock';

let mockTopic: MockTopic;

vi.mock('roslib', () => ({
  default: {
    // Must use `function` keyword so Vitest allows `new ROSLIB.Topic(...)`.
    // eslint-disable-next-line prefer-arrow-callback
    Topic: vi.fn(function () {
      return mockTopic;
    }),
    // Must use `function` keyword so Vitest allows `new ROSLIB.Message(...)`.
    // eslint-disable-next-line prefer-arrow-callback
    Message: vi.fn(function (data: unknown) {
      return data;
    }),
  },
}));

const { createTopicPublisher } = await import('./TopicPublisher');

const mockRos = {} as ROSLIB.Ros;

describe('createTopicPublisher', () => {
  beforeEach(() => {
    mockTopic = createMockTopic('/cmd_vel');
    vi.clearAllMocks();
  });

  it('creates ROSLIB.Topic with correct name and messageType', async () => {
    const { default: ROSLIB } = await import('roslib');
    const TopicSpy = vi.mocked(ROSLIB.Topic);

    createTopicPublisher(mockRos, '/cmd_vel', 'geometry_msgs/Twist');

    expect(TopicSpy).toHaveBeenCalledOnce();
    expect(TopicSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '/cmd_vel',
        messageType: 'geometry_msgs/Twist',
      })
    );
  });

  it('advertises the topic on creation', () => {
    createTopicPublisher(mockRos, '/cmd_vel', 'geometry_msgs/Twist');
    expect(mockTopic.advertise).toHaveBeenCalledOnce();
  });

  it('wraps message in ROSLIB.Message and calls topic.publish', async () => {
    const { default: ROSLIB } = await import('roslib');
    const MessageSpy = vi.mocked(ROSLIB.Message);

    const handle = createTopicPublisher<{ linear: { x: number } }>(
      mockRos,
      '/cmd_vel',
      'geometry_msgs/Twist'
    );

    const payload = { linear: { x: 1.0 } };
    handle.publish(payload);

    expect(MessageSpy).toHaveBeenCalledOnce();
    expect(MessageSpy).toHaveBeenCalledWith(payload);
    expect(mockTopic.publish).toHaveBeenCalledOnce();
    // The wrapped ROSLIB.Message return value is what gets passed to publish.
    expect(mockTopic.publish).toHaveBeenCalledWith(expect.anything());
  });

  it('calls topic.unadvertise on destroy', () => {
    const handle = createTopicPublisher(
      mockRos,
      '/cmd_vel',
      'geometry_msgs/Twist'
    );

    expect(mockTopic.unadvertise).not.toHaveBeenCalled();

    handle.destroy();

    expect(mockTopic.unadvertise).toHaveBeenCalledOnce();
  });
});
