import { useEffect, useMemo, useRef, useState } from 'react';
import type { Ros } from 'roslib';

import { useRosSubscriber } from '../useRosSubscriber';
import { rafThrottle } from '@/utils';

import { quaternionToEuler } from './helpers';
import { imuMessageSchema } from './schemas';
import type { UseImuReturn } from './types';

/** useImuSubscription
 * @description Subscribes to a sensor_msgs/msg/Imu topic, converts quaternion orientation
 *  to Euler angles, and throttles updates to animation frame rate.
 * @param ros - Active roslib connection, or undefined when disconnected.
 * @param topicName - The IMU topic name to subscribe to.
 */
export function useImuSubscription(ros: Ros | undefined, topicName: string): UseImuReturn {
  const [state, setState] = useState<UseImuReturn>({
    angularVelocity: undefined,
    linearAcceleration: undefined,
    pitch: 0,
    roll: 0,
    yaw: 0,
  });

  const latestRef = useRef(state);

  // Throttle setState to animation frame rate
  const throttledSet = useMemo(
    () =>
      rafThrottle((next: UseImuReturn) => {
        setState(next);
      }),
    [],
  );

  useEffect(() => {
    return () => {
      throttledSet.cancel();
    };
  }, [throttledSet]);

  const onMessage = useMemo(
    () => (msg: unknown) => {
      try {
        console.log('msg======', msg);
        const result = imuMessageSchema.safeParse(msg);
        if (!result.success) {
          console.warn('[useImuSubscription] Malformed message:', result.error.issues);
          return;
        }
        const m = result.data;
        const euler = quaternionToEuler(m.orientation);
        const next: UseImuReturn = {
          angularVelocity: m.angular_velocity,
          linearAcceleration: m.linear_acceleration,
          pitch: euler.pitch,
          roll: euler.roll,
          yaw: euler.yaw,
        };
        latestRef.current = next;
        throttledSet(next);
      } catch (err) {
        console.warn('[useImuSubscription] Unexpected error processing message:', err);
      }
    },
    [throttledSet],
  );

  useRosSubscriber(ros, topicName, 'sensor_msgs/msg/Imu', onMessage, { throttleRate: 100 });

  return state;
}
