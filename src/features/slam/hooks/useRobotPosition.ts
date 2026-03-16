import { useMemo } from 'react';
import { EMPTY, type Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ODOM_DEFAULT_TOPIC,
  ODOM_MESSAGE_TYPE,
  type RobotPosition,
} from '../slam.types';

import { useRosConnection } from '@/features/telemetry/shared/useRosConnection';
import { useObservable } from '@/hooks/useObservable';
import {
  createTopicSubscription,
  TOPIC_THROTTLE_MS,
} from '@/services/ros/subscriber/TopicSubscriber';
import type { OdometryMessage } from '@/types/ros-messages';

// ---------------------------------------------------------------------------
// Quaternion → yaw helper
// ---------------------------------------------------------------------------

/**
 * Extracts the yaw angle (rotation around Z axis) from a quaternion.
 * Uses the standard atan2 decomposition for a Z-up coordinate frame.
 */
function quaternionToYaw(
  qx: number,
  qy: number,
  qz: number,
  qw: number
): number {
  // yaw (z-axis rotation)
  const sinYaw = 2 * (qw * qz + qx * qy);
  const cosYaw = 1 - 2 * (qy * qy + qz * qz);
  return Math.atan2(sinYaw, cosYaw);
}

// ---------------------------------------------------------------------------
// useRobotPosition
// ---------------------------------------------------------------------------

/**
 * Subscribes to the ROS odometry topic and returns the robot's current world
 * position and heading.
 *
 * - Throttled at the ODOMETRY rate to avoid excessive re-renders.
 * - Returns null when the robot is not connected or no message has been
 *   received yet.
 */
export function useRobotPosition(
  robotId: string | undefined
): RobotPosition | null {
  const { ros } = useRosConnection(robotId);

  const odom$ = useMemo<Observable<RobotPosition | null>>(() => {
    if (ros === null) return EMPTY as Observable<RobotPosition | null>;

    return createTopicSubscription<OdometryMessage>(
      ros,
      ODOM_DEFAULT_TOPIC,
      ODOM_MESSAGE_TYPE,
      { throttleMs: TOPIC_THROTTLE_MS.ODOMETRY }
    ).pipe(
      map((msg): RobotPosition => {
        const { x, y } = msg.pose.pose.position;
        const { x: qx, y: qy, z: qz, w: qw } = msg.pose.pose.orientation;
        return {
          x,
          y,
          heading: quaternionToYaw(qx, qy, qz, qw),
        };
      })
    ) as Observable<RobotPosition | null>;
  }, [ros]);

  return useObservable<RobotPosition | null>(odom$, null);
}
