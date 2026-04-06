import { useEffect, useRef } from 'react';
import { Topic, type Ros } from 'roslib';

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
