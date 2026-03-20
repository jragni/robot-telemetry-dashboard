import ROSLIB from 'roslib';

export interface RosTopicLike {
  subscribe: (callback: (message: unknown) => void) => void;
  unsubscribe: () => void;
}

interface RosWithTopicRegistry {
  getRosTopic?: (name: string) => RosTopicLike | undefined;
}

/**
 * Get or create a ROS topic.
 *
 * In tests, MockRos pre-registers MockTopic instances by name.
 * This function returns the pre-registered mock if available, enabling
 * test spies (e.g. unsubscribeSpy) to work correctly.
 *
 * In production, creates a real ROSLIB.Topic.
 */
export function createRosTopic(
  ros: unknown,
  name: string,
  messageType: string
): RosTopicLike {
  const rosLike = ros as RosWithTopicRegistry;
  const existing = rosLike.getRosTopic?.(name);
  if (existing) return existing;

  return new ROSLIB.Topic({
    ros: ros as ROSLIB.Ros,
    name,
    messageType,
  });
}
