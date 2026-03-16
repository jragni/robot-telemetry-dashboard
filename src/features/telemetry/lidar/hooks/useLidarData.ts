import { useMemo } from 'react';
import { EMPTY, type Observable } from 'rxjs';

import {
  LIDAR_DEFAULT_TOPIC,
  LIDAR_MESSAGE_TYPE,
  type LidarRenderData,
} from '../lidar.types';
import { transformLaserScan } from '../lidar.utils';

import { useRosConnection } from '@/features/telemetry/shared';
import { useObservable } from '@/hooks/useObservable';
import {
  createTopicSubscription,
  TOPIC_THROTTLE_MS,
} from '@/services/ros/TopicSubscriber';
import type { LaserScanMessage } from '@/types/ros-messages';

// ---------------------------------------------------------------------------
// useLidarData
// ---------------------------------------------------------------------------

export interface UseLidarDataOptions {
  topicName?: string;
}

export interface UseLidarDataResult {
  data: LidarRenderData | null;
  connectionState: ReturnType<typeof useRosConnection>['connectionState'];
  topicName: string;
}

/**
 * Subscribes to a ROS LaserScan topic and returns transformed
 * {@link LidarRenderData} ready for canvas rendering.
 *
 * Pattern follows useImuData:
 * 1. Obtain the live ROS connection via useRosConnection.
 * 2. Create a throttled topic subscription via createTopicSubscription.
 * 3. Subscribe to the observable with useObservable.
 * 4. Transform the raw message with transformLaserScan.
 */
export function useLidarData(
  robotId: string | undefined,
  options: UseLidarDataOptions = {}
): UseLidarDataResult {
  const { topicName = LIDAR_DEFAULT_TOPIC } = options;

  const { ros, connectionState } = useRosConnection(robotId);

  const topic$ = useMemo<Observable<LaserScanMessage | null>>(() => {
    if (ros === null) return EMPTY as Observable<LaserScanMessage | null>;
    return createTopicSubscription<LaserScanMessage>(
      ros,
      topicName,
      LIDAR_MESSAGE_TYPE,
      { throttleMs: TOPIC_THROTTLE_MS.LIDAR }
    ) as Observable<LaserScanMessage | null>;
  }, [ros, topicName]);

  const rawMessage = useObservable<LaserScanMessage | null>(topic$, null);

  const data = useMemo<LidarRenderData | null>(() => {
    if (rawMessage === null) return null;
    return transformLaserScan(rawMessage);
  }, [rawMessage]);

  return { data, connectionState, topicName };
}
