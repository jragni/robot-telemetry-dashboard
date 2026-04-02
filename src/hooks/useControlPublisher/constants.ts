import type { TwistMessage } from '@/types/ros2-messages.types';

export const ZERO_TWIST: TwistMessage = {
  linear: { x: 0, y: 0, z: 0 },
  angular: { x: 0, y: 0, z: 0 },
};

export const DEFAULT_PUBLISH_RATE = 10;
