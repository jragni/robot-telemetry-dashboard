/** normalizeCborMessage
 * @description Recursively normalizes a CBOR-decoded ROS message for Zod compatibility.
 *  CBOR decodes float arrays as TypedArrays (Float32Array, Float64Array) which Zod's
 *  z.array() rejects (Array.isArray returns false). NaN values in arrays are converted
 *  to null since Zod rejects NaN and downstream code already skips nulls.
 *
 *  Called once in useRosSubscriber before passing the message to consumers.
 *  Keeps CBOR normalization (transport artifact) separate from rosbridge null handling
 *  (protocol semantics) which remains in individual Zod schemas.
 * @param value - Raw CBOR-decoded message from roslib.
 */
export function normalizeCborMessage(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value === 'number') return Number.isNaN(value) ? null : value;
  if (typeof value !== 'object') return value;

  // TypedArrays (Float32Array, Float64Array, etc.) → plain arrays with NaN → null
  if (ArrayBuffer.isView(value)) {
    return Array.from(value as Float32Array, (v) => (Number.isNaN(v) ? null : v));
  }

  // Plain arrays — recurse into elements
  if (Array.isArray(value)) {
    return value.map(normalizeCborMessage);
  }

  // Plain objects — recurse into values
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    result[k] = normalizeCborMessage(v);
  }
  return result;
}
