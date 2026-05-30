import { z } from 'zod';

/** batteryStateMessageSchema
 * @description Zod schema validating the consumed fields of sensor_msgs/msg/BatteryState.
 *  All fields accept null (rosbridge serializes NaN/unknown as null) so a single
 *  unknown field never drops the whole message.
 */
export const batteryStateMessageSchema = z.object({
  percentage: z.number().nullable(),
  power_supply_status: z.number().nullable(),
  voltage: z.number().nullable(),
});
