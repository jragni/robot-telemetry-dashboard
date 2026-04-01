import type { RobotColor } from './useConnectionStore.types';

const ROBOT_COLORS: readonly RobotColor[] = [
  'blue',
  'cyan',
  'green',
  'amber',
  'red',
  'purple',
  'teal',
  'orange',
  'pink',
  'lime',
  'indigo',
  'rose',
];

/** assignRobotColor
 * @description Assigns a color to a robot deterministically based on
 *  its name hash.
 * @param name - The robot name to hash.
 * @returns The assigned robot color.
 */
/** deriveWebRtcUrl
 * @description Derives the WebRTC signaling URL from a robot's base WebSocket
 *  URL. Appends `/webrtc` to the base. Returns empty string if no URL.
 * @param baseUrl - The robot's base URL (e.g., ws://192.168.1.10).
 */
export function deriveWebRtcUrl(baseUrl: string): string {
  if (!baseUrl) return '';
  const clean = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${clean}/webrtc`;
}

/** deriveRosbridgeUrl
 * @description Derives the rosbridge WebSocket URL from a robot's base URL.
 *  Appends `/rosbridge` to the base. Returns empty string if no URL.
 * @param baseUrl - The robot's base URL (e.g., ws://192.168.1.10).
 */
export function deriveRosbridgeUrl(baseUrl: string): string {
  if (!baseUrl) return '';
  const clean = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${clean}/rosbridge`;
}

/** assignRobotColor
 * @description Assigns a color to a robot deterministically based on
 *  its name hash.
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
