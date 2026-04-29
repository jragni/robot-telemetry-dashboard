import { z } from 'zod';

/** batteryStateMessageSchema
 * @description Zod schema validating the consumed fields of sensor_msgs/msg/BatteryState.
 */
export const batteryStateMessageSchema = z.object({
  percentage: z.number(),
  power_supply_status: z.number(),
  voltage: z.number(),
});
