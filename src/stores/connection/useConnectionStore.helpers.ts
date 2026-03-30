import type { RobotColor } from './useConnectionStore.types';

const ROBOT_COLORS: readonly RobotColor[] = [
  'blue',
  'cyan',
  'green',
  'amber',
  'red',
  'purple',
];

/**
 * Assigns a color to a robot deterministically based on its name hash.
 * @param name - The robot name to hash.
 * @returns The assigned robot color.
 */
export function assignRobotColor(name: string): RobotColor {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return ROBOT_COLORS[Math.abs(hash) % ROBOT_COLORS.length] ?? 'blue';
}
