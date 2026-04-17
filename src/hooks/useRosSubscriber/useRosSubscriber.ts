import { useEffect, useRef } from 'react';
import { Topic, type Ros } from 'roslib';

import type { SubscriberOptions } from './useRosSubscriber.types';

/** useRosSubscriber
 * @description Subscribes to a ROS topic via roslib and invokes a callback on each message.
 *  Automatically unsubscribes on cleanup or when dependencies change. Supports optional
 *  CBOR compression, server-side throttle_rate, and queue_length via the options parameter.
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

    const topicOptions: ConstructorParameters<typeof Topic>[0] = {
      compression: options?.compression ?? 'cbor',
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
      // Temporary debug logging for T-113 — gated behind runtime flag
      // Enable in browser console: window.__DEBUG_ROS__ = true
      if (typeof window !== 'undefined' && (window as Record<string, unknown>).__DEBUG_ROS__) {
        const fields: Record<string, string> = {};
        if (message && typeof message === 'object') {
          for (const [k, v] of Object.entries(message as Record<string, unknown>)) {
            if (ArrayBuffer.isView(v)) {
              fields[k] = `${v.constructor.name}(${String((v as ArrayLike<unknown>).length)})`;
            } else if (Array.isArray(v)) {
              fields[k] = `Array(${String(v.length)})`;
            } else if (v === null) {
              fields[k] = 'null';
            } else if (typeof v === 'object') {
              fields[k] = `Object{${Object.keys(v as Record<string, unknown>).join(',')}}`;
            }
          }
        }
        console.log('[ROS DEBUG]', { topic: topicName, messageType, fields, raw: message });
      }
      callbackRef.current(message);
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
