import { useEffect, useRef } from 'react';
import { Topic, type Ros } from 'roslib';

/** useRosSubscriber
 * @description Subscribes to a ROS topic via roslib and invokes a callback on each message.
 *  Automatically unsubscribes on cleanup or when dependencies change.
 * @param ros - Active roslib connection, or undefined when disconnected.
 * @param topicName - The ROS topic name.
 * @param messageType - The ROS message type string.
 * @param onMessage - Callback invoked with each incoming message.
 */
export function useRosSubscriber(
  ros: Ros | undefined,
  topicName: string,
  messageType: string,
  onMessage: (message: unknown) => void,
): void {
  const callbackRef = useRef(onMessage);

  useEffect(() => {
    callbackRef.current = onMessage;
  });

  useEffect(() => {
    if (!ros || !topicName || !messageType) return;

    const topic = new Topic({
      ros,
      name: topicName,
      messageType,
    });

    topic.subscribe((message) => {
      callbackRef.current(message);
    });

    return () => {
      topic.unsubscribe();
    };
  }, [ros, topicName, messageType]);
}
