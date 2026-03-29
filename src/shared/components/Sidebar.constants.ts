import { LayoutGrid, Map, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ConnectionStatus } from '../stores/connection/useConnectionStore.types';

export interface NavItemData {
  readonly Icon: LucideIcon;
  readonly label: string;
  readonly path: string;
  readonly status?: ConnectionStatus;
}

export const SYSTEM_ITEMS: readonly NavItemData[] = [
  { Icon: LayoutGrid, label: 'Fleet', path: '/fleet' },
  { Icon: Map, label: 'Map', path: '/map' },
  { Icon: Settings, label: 'Settings', path: '/settings' },
];

export const STATUS_BG: Record<string, string> = {
  nominal: 'bg-status-nominal',
  caution: 'bg-status-caution',
  critical: 'bg-status-critical',
  offline: 'bg-status-offline',
};
