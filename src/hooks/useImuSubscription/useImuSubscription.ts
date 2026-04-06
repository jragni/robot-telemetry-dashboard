import { useEffect, useMemo, useRef, useState } from 'react';
import type { Ros } from 'roslib';
import { z } from 'zod';
import { useRosSubscriber } from '@/hooks/useRosSubscriber';
import { rafThrottle } from '@/utils/rafThrottle';
import { sensorVector3Schema } from '@/types/ros2-schemas';
import type { Vector3 } from '@/types/ros2-primitives.types';

const quaternionSchema = z.object({ x: z.number(), y: z.number(), z: z.number(), w: z.number() });

/** imuMessageSchema
 * @description Zod schema validating the consumed fields of sensor_msgs/msg/Imu.
 */
export const imuMessageSchema = z.object({
  orientation: quaternionSchema,
  angular_velocity: sensorVector3Schema.optional(),
  linear_acceleration: sensorVector3Schema.optional(),
});

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

export function useImuSubscription(ros: Ros | undefined, topicName: string): UseImuReturn {
  const [state, setState] = useState<UseImuReturn>({
    angularVelocity: undefined, linearAcceleration: undefined,
    pitch: 0, roll: 0, yaw: 0,
  });

  const latestRef = useRef(state);

  // Throttle setState to animation frame rate
  const throttledSet = useMemo(() => rafThrottle((next: UseImuReturn) => {
    setState(next);
  }), []);

  useEffect(() => {
    return () => { throttledSet.cancel(); };
  }, [throttledSet]);

  const onMessage = useMemo(() => (msg: unknown) => {
    try {
      const result = imuMessageSchema.safeParse(msg);
      if (!result.success) {
        console.warn('[useImuSubscription] Malformed message:', result.error.issues);
        return;
      }
      const m = result.data;
      const euler = quaternionToEuler(m.orientation);
      const next: UseImuReturn = {
        roll: euler.roll, pitch: euler.pitch, yaw: euler.yaw,
        angularVelocity: m.angular_velocity, linearAcceleration: m.linear_acceleration,
      };
      latestRef.current = next;
      throttledSet(next);
    } catch (err) {
      console.warn('[useImuSubscription] Unexpected error processing message:', err);
    }
  }, [throttledSet]);

  useRosSubscriber(ros, topicName, 'sensor_msgs/msg/Imu', onMessage);

  return state;
}
