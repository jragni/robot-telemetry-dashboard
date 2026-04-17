import { z } from 'zod';

/** coerceToArray
 * @description Coerces typed arrays (Float32Array, Float64Array, etc.) and null to plain
 *  JavaScript arrays. CBOR decodes ROS float[] fields as TypedArrays, but Zod's z.array()
 *  rejects them (Array.isArray returns false for TypedArrays).
 */
export function coerceToArray(val: unknown): unknown {
  if (val == null) return [];
  if (ArrayBuffer.isView(val)) return Array.from(val as Float32Array);
  return val;
}

/** vector3Schema
 * @description Zod schema for geometry_msgs/msg/Vector3. Accepts null (rosbridge CBOR
 *  serialization) and defaults to zero vector.
 */
export const vector3Schema = z
  .object({ x: z.number(), y: z.number(), z: z.number() })
  .nullable()
  .transform((v) => v ?? { x: 0, y: 0, z: 0 });

/** sensorVector3Schema
 * @description Nullable variant of vector3Schema for sensor data. Rosbridge may
 *  serialize a faulted axis as null. Null axes default to 0 so consumers never
 *  see null values.
 */
export const sensorVector3Schema = z.object({
  x: z
    .number()
    .nullable()
    .transform((v) => v ?? 0)
    .default(0),
  y: z
    .number()
    .nullable()
    .transform((v) => v ?? 0)
    .default(0),
  z: z
    .number()
    .nullable()
    .transform((v) => v ?? 0)
    .default(0),
});
