import { z } from 'zod';

import { sensorVector3Schema } from '@/types/ros2-schemas';
import type { Quaternion } from '@/types/ros2-primitives.types';

const quaternionSchema = z
  .object({
    w: z.number().nullable(),
    x: z.number().nullable(),
    y: z.number().nullable(),
    z: z.number().nullable(),
  })
  .nullable()
  .transform((v): Quaternion | null => {
    // Unknown orientation (rosbridge serializes a faulted axis or the whole
    // quaternion as null) returns null — never identity, which a consumer
    // cannot distinguish from a sensor genuinely at level (T-165).
    if (v === null) return null;
    const { w, x, y, z } = v;
    if (w === null || x === null || y === null || z === null) return null;
    return { w, x, y, z };
  });

/** imuMessageSchema
 * @description Zod schema validating the consumed fields of sensor_msgs/msg/Imu.
 *  All fields accept null (rosbridge CBOR serialization) with safe defaults.
 */
export const imuMessageSchema = z.object({
  angular_velocity: sensorVector3Schema
    .nullable()
    .optional()
    .transform((v) => v ?? undefined),
  linear_acceleration: sensorVector3Schema
    .nullable()
    .optional()
    .transform((v) => v ?? undefined),
  orientation: quaternionSchema,
});
