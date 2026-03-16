import ROSLIB from 'roslib';

import { createLogger } from '@/lib/logger';

const log = createLogger('TopicPublisher');

export interface TopicPublisherHandle<T> {
  /** Wraps `message` in a ROSLIB.Message and publishes it to the ROS topic. */
  publish: (message: T) => void;
  /** Calls unadvertise on the underlying ROSLIB.Topic and releases resources. */
  destroy: () => void;
}

/**
 * Creates a publisher for a ROS topic.
 *
 * The underlying ROSLIB.Topic is advertised immediately on creation.
 * Call `destroy()` to unadvertise when the publisher is no longer needed.
 *
 * @param ros         Active ROSLIB.Ros connection.
 * @param topicName   ROS topic name, e.g. `/cmd_vel`.
 * @param messageType ROS message type, e.g. `geometry_msgs/Twist`.
 */
export function createTopicPublisher<T>(
  ros: ROSLIB.Ros,
  topicName: string,
  messageType: string
): TopicPublisherHandle<T> {
  log.debug(`Creating publisher for ${topicName} (${messageType})`);

  const topic = new ROSLIB.Topic({ ros, name: topicName, messageType });
  topic.advertise();

  return {
    publish(message: T): void {
      log.debug(`Publishing to ${topicName}`);
      const roslibMessage = new ROSLIB.Message(
        message as Record<string, unknown>
      );
      topic.publish(roslibMessage);
    },

    destroy(): void {
      log.debug(`Unadvertising ${topicName}`);
      topic.unadvertise();
    },
  };
}
