import { z } from 'zod';

/** laserScanMessageSchema
 * @description Zod schema validating the consumed fields of sensor_msgs/msg/LaserScan.
 *  TypedArray->Array and NaN->null normalization is handled upstream by normalizeCborMessage
 *  in useRosSubscriber. Schemas only handle rosbridge null semantics.
 */
export const laserScanMessageSchema = z.object({
  angle_increment: z.number(),
  angle_min: z.number(),
  intensities: z.array(z.number().nullable()).optional().default([]),
  range_max: z.number(),
  range_min: z.number(),
  ranges: z.array(z.number().nullable()),
});
