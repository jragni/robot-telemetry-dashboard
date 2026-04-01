import { useEffect, useRef } from 'react';
import { Topic, type Ros } from 'roslib';

/** useRosSubscriber
 * @description Subscribes to a ROS topic via roslib and pushes each incoming
 *  message to the provided callback. Automatically unsubscribes on unmount,
 *  topic change, or disconnection.
 * @param ros - The live Ros instance, or undefined if disconnected.
 * @param topicName - The ROS topic to subscribe to (e.g., "/scan").
 * @param messageType - The ROS message type (e.g., "sensor_msgs/msg/LaserScan").
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
