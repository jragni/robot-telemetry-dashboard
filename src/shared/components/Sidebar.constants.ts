import { Map, Play, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ConnectionStatus } from '../stores/connection/useConnectionStore.types';

export interface NavItemData {
  readonly Icon: LucideIcon;
  readonly label: string;
  readonly path: string;
  readonly status?: ConnectionStatus;
}

export const SYSTEM_ITEMS: readonly NavItemData[] = [
  { Icon: Map, label: 'Map', path: '/map' },
  { Icon: Play, label: 'Try Demo', path: '/demo' },
  { Icon: Settings, label: 'Settings', path: '/settings' },
];

export const STATUS_BG: Record<string, string> = {
  nominal: 'bg-status-nominal',
  caution: 'bg-status-caution',
  critical: 'bg-status-critical',
  offline: 'bg-status-offline',
};
