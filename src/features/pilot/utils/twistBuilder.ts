import type { Direction } from '../types/robot-control.types';

import type { Twist } from '@/shared/types/ros-messages.types';

export function buildTwist(
  direction: Direction,
  linear: number,
  angular: number
): Twist {
  const map: Record<Direction, Twist> = {
    forward: {
      linear: { x: linear, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: 0 },
    },
    backward: {
      linear: { x: -linear, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: 0 },
    },
    left: { linear: { x: 0, y: 0, z: 0 }, angular: { x: 0, y: 0, z: angular } },
    right: {
      linear: { x: 0, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: -angular },
    },
    stop: { linear: { x: 0, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0 } },
  };
  return map[direction];
}

export function zeroTwist(): Twist {
  return { linear: { x: 0, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0 } };
}
