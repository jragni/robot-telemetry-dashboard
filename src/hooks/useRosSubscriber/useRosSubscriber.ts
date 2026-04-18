import { useEffect, useRef } from 'react';
import { Topic, type Ros } from 'roslib';

import { normalizeCborMessage } from '@/utils';

import type { SubscriberOptions } from './types';

/** useRosSubscriber
 * @description Subscribes to a ROS topic via roslib and invokes a callback on each message.
 *  Automatically unsubscribes on cleanup or when dependencies change. Supports optional
 *  CBOR compression, server-side throttle_rate, and queue_length via the options parameter.
 *  When CBOR compression is active, normalizes the decoded message (TypedArray→Array,
 *  NaN→null) before passing to the callback.
 * @param ros - Active roslib connection, or undefined when disconnected.
 * @param topicName - The ROS topic name.
 * @param messageType - The ROS message type string.
 * @param onMessage - Callback invoked with each incoming message.
 * @param options - Optional subscriber configuration for compression, throttle rate, and queue length.
 */
export function useRosSubscriber(
  ros: Ros | undefined,
  topicName: string,
  messageType: string,
  onMessage: (message: unknown) => void,
  options?: SubscriberOptions,
): void {
  const callbackRef = useRef(onMessage);

  useEffect(() => {
    callbackRef.current = onMessage;
  });

  useEffect(() => {
    if (!ros || !topicName || !messageType) return;

    const compression = options?.compression ?? 'cbor';

    const topicOptions: ConstructorParameters<typeof Topic>[0] = {
      compression,
      messageType,
      name: topicName,
      queue_length: options?.queueLength ?? 1,
      ros,
    };

    if (options?.throttleRate !== undefined) {
      topicOptions.throttle_rate = options.throttleRate;
    }

    const topic = new Topic(topicOptions);

    topic.subscribe((message) => {
      callbackRef.current(compression === 'cbor' ? normalizeCborMessage(message) : message);
    });

    return () => {
      topic.unsubscribe();
    };
  }, [
    ros,
    topicName,
    messageType,
    options?.compression,
    options?.queueLength,
    options?.throttleRate,
  ]);
}
