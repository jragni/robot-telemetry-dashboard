import { z } from 'zod';

/** finiteOrNull
 * @description A numeric field that tolerates the non-finite sentinels BatteryState
 *  uses for unknown readings: NaN and +/-Infinity coerce to null rather than failing
 *  the whole message (zod's z.number() rejects both). A missing key or non-numeric
 *  value still rejects, so a genuinely malformed message is not silently accepted.
 */
const finiteOrNull = z.preprocess(
  (v) => (typeof v === 'number' && !Number.isFinite(v) ? null : v),
  z.number().nullable(),
);

/** batteryStateMessageSchema
 * @description Zod schema validating the consumed fields of sensor_msgs/msg/BatteryState.
 *  Each field tolerates null and non-finite sentinels so one unknown field (e.g. an
 *  unknown voltage) never drops the whole message and blank a known percentage.
 */
export const batteryStateMessageSchema = z.object({
  percentage: finiteOrNull,
  power_supply_status: finiteOrNull,
  voltage: finiteOrNull,
});
