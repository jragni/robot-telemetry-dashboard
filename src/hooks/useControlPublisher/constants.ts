import type { TwistMessage } from '@/types/ros2-messages.types';

/** ZERO_TWIST
 * @description A TwistMessage with all velocities set to zero. Sent on
 *  direction release, stop, and emergency stop.
 */
export const ZERO_TWIST: TwistMessage = {
  linear: { x: 0, y: 0, z: 0 },
  angular: { x: 0, y: 0, z: 0 },
};

/** DEFAULT_PUBLISH_RATE
 * @description Default command publish rate in Hz.
 */
export const DEFAULT_PUBLISH_RATE = 10;
