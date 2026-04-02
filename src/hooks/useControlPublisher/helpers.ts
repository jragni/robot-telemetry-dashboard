import type { TwistMessage } from '@/types/ros2-messages.types';
import type { Direction } from '@/types/control.types';
import { ZERO_TWIST } from './constants';

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
