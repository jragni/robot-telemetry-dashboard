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

export function toRobotId(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

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

export const persistedStateSchema = z.object({
  robots: z.record(z.string(), robotConnectionSchema),
});
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

export function isValidRobotColor(value: string): value is RobotColor {
  return (ROBOT_COLORS as readonly string[]).includes(value);
}

export function assignRobotColor(name: string): RobotColor {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return ROBOT_COLORS[Math.abs(hash) % ROBOT_COLORS.length] ?? 'blue';
}
