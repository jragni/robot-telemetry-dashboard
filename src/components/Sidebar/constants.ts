import { LayoutGrid, Map, Palette, Settings } from 'lucide-react';
import type { RobotColor } from '@/stores/connection/useConnectionStore.types';
import type { NavItemData } from '@/types/Sidebar.types';

export const SYSTEM_ITEMS: readonly NavItemData[] = [
  { Icon: LayoutGrid, label: 'Fleet', path: '/fleet' },
  { Icon: Map, label: 'Map', path: '/map' },
  { Icon: Settings, label: 'Settings', path: '/settings' },
  { Icon: Palette, label: 'Mockups', path: '/mockups' },
];

export const ROBOT_COLOR_DOT: Record<RobotColor, string> = {
  amber: 'bg-robot-amber',
  blue: 'bg-robot-blue',
  cyan: 'bg-robot-cyan',
  green: 'bg-robot-green',
  indigo: 'bg-robot-indigo',
  lime: 'bg-robot-lime',
  orange: 'bg-robot-orange',
  pink: 'bg-robot-pink',
  purple: 'bg-robot-purple',
  red: 'bg-robot-red',
  rose: 'bg-robot-rose',
  teal: 'bg-robot-teal',
};

export const ROBOT_COLOR_TEXT: Record<RobotColor, string> = {
  amber: 'text-robot-amber',
  blue: 'text-robot-blue',
  cyan: 'text-robot-cyan',
  green: 'text-robot-green',
  indigo: 'text-robot-indigo',
  lime: 'text-robot-lime',
  orange: 'text-robot-orange',
  pink: 'text-robot-pink',
  purple: 'text-robot-purple',
  red: 'text-robot-red',
  rose: 'text-robot-rose',
  teal: 'text-robot-teal',
};

export const NAV_ITEM_BASE =
  'flex items-center justify-start gap-2 w-full text-left font-sans text-sm rounded-none cursor-pointer whitespace-nowrap overflow-hidden border-none transition-all duration-150 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[-2px]';

export const NAV_ITEM_ACTIVE = 'text-accent bg-accent-subtle';

export const NAV_ITEM_INACTIVE =
  'text-text-secondary bg-transparent hover:bg-accent-subtle hover:text-text-primary';
