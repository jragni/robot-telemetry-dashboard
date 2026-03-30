import { Crosshair, LayoutGrid, Map, Settings } from 'lucide-react';
import type { RobotColor } from '@/stores/connection/useConnectionStore.types';
import type { NavItemData } from './Sidebar.types';

export const SYSTEM_ITEMS: readonly NavItemData[] = [
  { Icon: LayoutGrid, label: 'Fleet', path: '/fleet' },
  { Icon: Crosshair, label: 'Pilot', path: '/pilot' },
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

export const ROBOT_COLOR_TEXT: Record<RobotColor, string> = {
  blue: 'text-robot-blue',
  cyan: 'text-robot-cyan',
  green: 'text-robot-green',
  amber: 'text-robot-amber',
  red: 'text-robot-red',
  purple: 'text-robot-purple',
};
