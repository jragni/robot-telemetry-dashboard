import type { TwistMessage } from '@/types/ros2-messages.types';
import type { Direction } from '@/types/control.types';
import { ZERO_TWIST } from './constants';

/** buildTwist
 * @description Constructs a TwistMessage from a direction and velocity
 *  magnitudes. Forward/backward maps to linear.x, left/right maps to
 *  angular.z.
 * @param direction - Movement direction.
 * @param linear - Linear velocity magnitude in m/s.
 * @param angular - Angular velocity magnitude in rad/s.
 * @returns A TwistMessage with the appropriate velocity values.
 */
export function buildTwist(direction: Direction, linear: number, angular: number): TwistMessage {
  switch (direction) {
    case 'forward':
      return { linear: { x: linear, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0 } };
    case 'backward':
      return { linear: { x: -linear, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0 } };
    case 'left':
      return { linear: { x: 0, y: 0, z: 0 }, angular: { x: 0, y: 0, z: angular } };
    case 'right':
      return { linear: { x: 0, y: 0, z: 0 }, angular: { x: 0, y: 0, z: -angular } };
    case 'stop':
      return ZERO_TWIST;
  }
}
