import { Crosshair, LayoutGrid, Map, Settings } from 'lucide-react';
import type { RobotColor } from '@/stores/connection/useConnectionStore.types';
import type { NavItemData } from '@/types/Sidebar.types';

/**
 * SYSTEM_ITEMS
 * @description Defines the primary navigation items rendered in the sidebar.
 */
export const SYSTEM_ITEMS: readonly NavItemData[] = [
  { Icon: LayoutGrid, label: 'Fleet', path: '/fleet' },
  { Icon: Crosshair, label: 'Pilot', path: '/pilot' },
  { Icon: Map, label: 'Map', path: '/map' },
  { Icon: Settings, label: 'Settings', path: '/settings' },
];

/**
 * ROBOT_COLOR_DOT
 * @description Maps each robot color to its corresponding Tailwind background utility class.
 */
export const ROBOT_COLOR_DOT: Record<RobotColor, string> = {
  blue: 'bg-robot-blue',
  cyan: 'bg-robot-cyan',
  green: 'bg-robot-green',
  amber: 'bg-robot-amber',
  red: 'bg-robot-red',
  purple: 'bg-robot-purple',
};

/**
 * ROBOT_COLOR_TEXT
 * @description Maps each robot color to its corresponding Tailwind text utility class.
 */
export const ROBOT_COLOR_TEXT: Record<RobotColor, string> = {
  blue: 'text-robot-blue',
  cyan: 'text-robot-cyan',
  green: 'text-robot-green',
  amber: 'text-robot-amber',
  red: 'text-robot-red',
  purple: 'text-robot-purple',
};

/** NAV_ITEM_BASE
 * @description Base classes shared by all sidebar navigation items.
 */
export const NAV_ITEM_BASE =
  'flex items-center justify-start gap-2 w-full text-left font-sans text-sm rounded-none cursor-pointer whitespace-nowrap overflow-hidden border-none transition-all duration-150 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[-2px]';

/** NAV_ITEM_ACTIVE
 * @description Classes applied to the currently active navigation item.
 */
export const NAV_ITEM_ACTIVE = 'text-accent bg-accent-subtle';

/** NAV_ITEM_INACTIVE
 * @description Classes applied to inactive navigation items.
 */
export const NAV_ITEM_INACTIVE =
  'text-text-secondary bg-transparent hover:bg-accent-subtle hover:text-text-primary';
