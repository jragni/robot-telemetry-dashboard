import { z } from 'zod';

import { sensorVector3Schema } from '@/types/ros2-schemas';

import { IDENTITY_QUATERNION } from './constants';

const quaternionSchema = z
  .object({
    w: z.number().nullable(),
    x: z.number().nullable(),
    y: z.number().nullable(),
    z: z.number().nullable(),
  })
  .nullable()
  .transform((v) => {
    if (v === null) return IDENTITY_QUATERNION;
    const { w, x, y, z } = v;
    if (w === null || x === null || y === null || z === null) return IDENTITY_QUATERNION;
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
