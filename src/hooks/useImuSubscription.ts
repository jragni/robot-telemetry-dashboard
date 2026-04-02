import { useMemo, useRef, useState } from 'react';
import type { Ros } from 'roslib';
import { useRosSubscriber } from '@/hooks/useRosSubscriber';
import { rafThrottle } from '@/utils/rafThrottle';
import type { ImuMessage } from '@/types/ros2-messages.types';
import type { Vector3 } from '@/types/ros2-primitives.types';

interface UseImuReturn {
  readonly roll: number;
  readonly pitch: number;
  readonly yaw: number;
  readonly angularVelocity: Vector3 | undefined;
  readonly linearAcceleration: Vector3 | undefined;
}

/** quaternionToEuler
 * @description Converts a quaternion to Euler angles in degrees.
 */
function quaternionToEuler(q: { x: number; y: number; z: number; w: number }) {
  const sinr = 2 * (q.w * q.x + q.y * q.z);
  const cosr = 1 - 2 * (q.x * q.x + q.y * q.y);
  const roll = Math.atan2(sinr, cosr);

  const sinp = 2 * (q.w * q.y - q.z * q.x);
  const pitch = Math.abs(sinp) >= 1 ? Math.sign(sinp) * (Math.PI / 2) : Math.asin(sinp);

  const siny = 2 * (q.w * q.z + q.x * q.y);
  const cosy = 1 - 2 * (q.y * q.y + q.z * q.z);
  const yaw = Math.atan2(siny, cosy);

  const toDeg = 180 / Math.PI;
  return { roll: roll * toDeg, pitch: pitch * toDeg, yaw: yaw * toDeg };
}

/** useImuSubscription
 * @description Subscribes to an IMU topic and converts quaternion orientation
 *  to Euler angles (degrees) for the ImuPanel. Throttled to RAF cadence.
 * @param ros - Live Ros instance, or undefined.
 * @param topicName - The IMU topic (e.g., "/imu/data").
 */
export function useImuSubscription(ros: Ros | undefined, topicName: string): UseImuReturn {
  const [state, setState] = useState<UseImuReturn>({
    roll: 0, pitch: 0, yaw: 0,
    angularVelocity: undefined, linearAcceleration: undefined,
  });

  const latestRef = useRef(state);

  // Throttle setState to animation frame rate
  const throttledSet = useMemo(() => rafThrottle((next: UseImuReturn) => {
    setState(next);
  }), []);

  const onMessage = useMemo(() => (msg: unknown) => {
    const m = msg as ImuMessage;
    const euler = quaternionToEuler(m.orientation);
    const next: UseImuReturn = {
      roll: euler.roll, pitch: euler.pitch, yaw: euler.yaw,
      angularVelocity: m.angular_velocity, linearAcceleration: m.linear_acceleration,
    };
    latestRef.current = next;
    throttledSet(next);
  }, [throttledSet]);

  useRosSubscriber(ros, topicName, 'sensor_msgs/msg/Imu', onMessage);

  return state;
}
