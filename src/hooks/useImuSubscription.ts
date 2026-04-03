import { useMemo, useRef, useState } from 'react';
import type { Ros } from 'roslib';
import { z } from 'zod';
import { useRosSubscriber } from '@/hooks/useRosSubscriber';
import { rafThrottle } from '@/utils/rafThrottle';
import { quaternionToEuler } from '@/utils/quaternionToEuler';
import type { ImuMessage } from '@/types/ros2-messages.types';
import type { Vector3 } from '@/types/ros2-primitives.types';

const vector3Schema = z.object({ x: z.number(), y: z.number(), z: z.number() });

const quaternionSchema = z.object({ x: z.number(), y: z.number(), z: z.number(), w: z.number() });

/** imuMessageSchema
 * @description Zod schema validating the consumed fields of sensor_msgs/msg/Imu.
 */
export const imuMessageSchema = z.object({
  orientation: quaternionSchema,
  angular_velocity: vector3Schema.optional(),
  linear_acceleration: vector3Schema.optional(),
});

interface UseImuReturn {
  readonly roll: number;
  readonly pitch: number;
  readonly yaw: number;
  readonly angularVelocity: Vector3 | undefined;
  readonly linearAcceleration: Vector3 | undefined;
}

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
