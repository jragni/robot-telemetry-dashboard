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

export function deriveWebRtcUrl(baseUrl: string): string {
  if (!baseUrl) return '';
  const clean = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${clean}/webrtc`;
}

export function deriveRosbridgeUrl(baseUrl: string): string {
  if (!baseUrl) return '';
  const clean = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${clean}/rosbridge`;
}

export function assignRobotColor(name: string): RobotColor {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return ROBOT_COLORS[Math.abs(hash) % ROBOT_COLORS.length] ?? 'blue';
}
