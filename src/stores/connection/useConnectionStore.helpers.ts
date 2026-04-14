import { z } from 'zod';
import type { RobotColor } from './useConnectionStore.types';

export const ROBOT_COLORS: readonly RobotColor[] = [
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

/** toRobotId
 * @description Converts a robot name into a URL-safe kebab-case identifier.
 * @param name - The human-readable robot name.
 */
export function toRobotId(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** robotConnectionSchema
 * @description Zod schema for validating persisted robot connection data from localStorage.
 */
export const robotConnectionSchema = z.object({
  color: z.string().optional(),
  id: z.string(),
  lastError: z.string().nullable().optional(),
  lastSeen: z.number().nullable().optional(),
  name: z.string(),
  selectedTopics: z.record(z.string(), z.string()).optional(),
  status: z.string().optional(),
  url: z.string(),
});

/** persistedStateSchema
 * @description Zod schema for validating the full persisted connection store shape.
 */
export const persistedStateSchema = z.object({
  robots: z.record(z.string(), robotConnectionSchema),
});

/** deriveWebRtcUrl
 * @description Appends /webrtc to a base URL for WebRTC signaling endpoint derivation.
 * @param baseUrl - The robot's base URL.
 */
export function deriveWebRtcUrl(baseUrl: string): string {
  if (!baseUrl) return '';
  const clean = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${clean}/webrtc`;
}

/** deriveRosbridgeUrl
 * @description Appends /rosbridge to a base URL for rosbridge WebSocket endpoint derivation.
 * @param baseUrl - The robot's base URL.
 */
export function deriveRosbridgeUrl(baseUrl: string): string {
  if (!baseUrl) return '';
  const clean = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${clean}/rosbridge`;
}

/** isValidRobotColor
 * @description Type guard that checks if a string is a valid RobotColor value.
 * @param value - The string to validate.
 */
export function isValidRobotColor(value: string): value is RobotColor {
  return (ROBOT_COLORS as readonly string[]).includes(value);
}

/** assignRobotColor
 * @description Deterministically assigns a color from the palette based on robot name hash.
 * @param name - The robot name to hash.
 */
export function assignRobotColor(name: string): RobotColor {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return ROBOT_COLORS[Math.abs(hash) % ROBOT_COLORS.length] ?? 'blue';
}
