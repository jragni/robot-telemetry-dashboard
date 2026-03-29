import { LayoutGrid, Map, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  ConnectionStatus,
  RobotColor,
} from '../stores/connection/useConnectionStore.types';

export interface NavItemData {
  readonly Icon: LucideIcon;
  readonly label: string;
  readonly path: string;
  readonly status?: ConnectionStatus;
  readonly robotColor?: RobotColor;
}

export const SYSTEM_ITEMS: readonly NavItemData[] = [
  { Icon: LayoutGrid, label: 'Fleet', path: '/fleet' },
  { Icon: Map, label: 'Map', path: '/map' },
  { Icon: Settings, label: 'Settings', path: '/settings' },
];

export const ROBOT_COLOR_DOT: Record<RobotColor, string> = {
  blue: 'bg-robot-blue',
  cyan: 'bg-robot-cyan',
  green: 'bg-robot-green',
  amber: 'bg-robot-amber',
  red: 'bg-robot-red',
  purple: 'bg-robot-purple',
};
