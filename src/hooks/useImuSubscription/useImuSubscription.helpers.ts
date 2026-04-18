/** quaternionToEuler
 * @description Converts a quaternion to Euler angles in degrees.
 * @param q - Quaternion with x, y, z, w components.
 */
export function quaternionToEuler(q: { x: number; y: number; z: number; w: number }) {
  const sinr = 2 * (q.w * q.x + q.y * q.z);
  const cosr = 1 - 2 * (q.x * q.x + q.y * q.y);
  const roll = Math.atan2(sinr, cosr);

  const sinp = 2 * (q.w * q.y - q.z * q.x);
  const pitch = Math.abs(sinp) >= 1 ? Math.sign(sinp) * (Math.PI / 2) : Math.asin(sinp);

  const siny = 2 * (q.w * q.z + q.x * q.y);
  const cosy = 1 - 2 * (q.y * q.y + q.z * q.z);
  const yaw = Math.atan2(siny, cosy);

  const toDeg = 180 / Math.PI;
  return { roll: roll * toDeg, pitch: pitch * toDeg, yaw: yaw * toDeg };
}
