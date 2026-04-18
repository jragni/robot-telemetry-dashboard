import { z } from 'zod';

import { sensorVector3Schema } from '@/types/ros2-schemas';

import { IDENTITY_QUATERNION } from './constants';

const quaternionSchema = z
  .object({ w: z.number(), x: z.number(), y: z.number(), z: z.number() })
  .nullable()
  .transform((v) => v ?? IDENTITY_QUATERNION);

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
