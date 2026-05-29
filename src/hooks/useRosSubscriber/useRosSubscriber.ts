import { useEffect, useRef } from 'react';
import { Topic, type Ros } from 'roslib';

import { normalizeCborMessage } from '@/utils';

import type { SubscriberOptions } from './types';

/** useRosSubscriber
 * @description Subscribes to a ROS topic via roslib and invokes a callback with each message.
 *  Automatically unsubscribes on cleanup or when dependencies change. Supports optional
 *  CBOR compression, server-side throttle_rate, and queue_length via the options parameter.
 *  Normalizes every decoded message (TypedArray→Array, non-finite→null) before passing it
 *  to the callback. By default coalesces messages to the latest one per animation frame so
 *  a buffered backlog (e.g. after a bandwidth dip) is parsed at most once per frame instead
 *  of all at once in a single blocking task; pass `coalesce: false` to receive every message.
 * @param ros - Active roslib connection, or undefined when disconnected.
 * @param topicName - The ROS topic name.
 * @param messageType - The ROS message type string.
 * @param onMessage - Callback invoked with each (normalized) incoming message.
 * @param options - Optional subscriber configuration for compression, throttle rate, queue length, and coalescing.
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
    const coalesce = options?.coalesce ?? true;

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

    let rafId: number | null = null;
    let latest: unknown = null;
    let hasLatest = false;

    const deliver = (raw: unknown) => {
      callbackRef.current(normalizeCborMessage(raw));
    };

    topic.subscribe((message) => {
      if (!coalesce) {
        deliver(message);
        return;
      }
      // Latest-wins: hold only the newest frame and flush it once on the next RAF, so a
      // burst of buffered messages collapses to a single parse instead of blocking the
      // main thread with hundreds of synchronous validations.
      latest = message;
      hasLatest = true;
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!hasLatest) return;
        const msg = latest;
        latest = null;
        hasLatest = false;
        deliver(msg);
      });
    });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      topic.unsubscribe();
    };
  }, [
    ros,
    topicName,
    messageType,
    options?.compression,
    options?.queueLength,
    options?.throttleRate,
    options?.coalesce,
  ]);
}
