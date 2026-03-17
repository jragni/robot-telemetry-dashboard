import { useMemo } from 'react';
import { EMPTY, type Observable } from 'rxjs';

import {
  type ImuDerivedData,
  IMU_DEFAULT_TOPIC,
  IMU_MESSAGE_TYPE,
} from '../imu.types';
import { transformImuMessage } from '../imu.utils';

import { useObservable } from '@/hooks/useObservable';
import { useRosConnection } from '@/hooks/useRosConnection';
import {
  createTopicSubscription,
  TOPIC_THROTTLE_MS,
} from '@/services/ros/subscriber/TopicSubscriber';
import type { ConnectionState } from '@/types/connection.types';
import type { ImuMessage } from '@/types/ros-messages';

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface UseImuDataResult {
  data: ImuDerivedData | null;
  connectionState: ConnectionState;
  topicName: string;
}

// ---------------------------------------------------------------------------
// useImuData
// ---------------------------------------------------------------------------

/**
 * Subscribes to the IMU topic for a given robot and returns derived IMU data.
 *
 * - Returns null for data when not connected or no message has arrived yet.
 * - Throttled to TOPIC_THROTTLE_MS.IMU (100 ms) to cap re-render frequency.
 */
export function useImuData(
  robotId: string | undefined,
  topicName: string = IMU_DEFAULT_TOPIC
): UseImuDataResult {
  const { ros, connectionState } = useRosConnection(robotId);

  const topic$: Observable<ImuMessage | null> = useMemo(() => {
    if (!ros) return EMPTY as Observable<ImuMessage | null>;
    return createTopicSubscription<ImuMessage>(
      ros,
      topicName,
      IMU_MESSAGE_TYPE,
      {
        throttleMs: TOPIC_THROTTLE_MS.IMU,
      }
    ) as Observable<ImuMessage | null>;
  }, [ros, topicName]);

  const rawMessage = useObservable<ImuMessage | null>(topic$, null);

  const data = useMemo<ImuDerivedData | null>(
    () => (rawMessage !== null ? transformImuMessage(rawMessage) : null),
    [rawMessage]
  );

  return { data, connectionState, topicName };
}
