import { Button } from '@/components/ui/button';
import type { NavItemProps } from '@/types/Sidebar.types';

import {
  NAV_ITEM_ACTIVE,
  NAV_ITEM_BASE,
  NAV_ITEM_INACTIVE,
  ROBOT_COLOR_DOT,
  ROBOT_COLOR_TEXT,
} from './constants';

/** NavItem
 * @description Renders a single navigation item with icon, label, and active state.
 * @prop item - Navigation item data (icon, label, path).
 * @prop active - Whether the item is currently active.
 * @prop collapsed - Whether the sidebar is in collapsed mode.
 * @prop onClick - Callback invoked when the item is clicked.
 */
export function NavItem({ item, active, collapsed, onClick }: NavItemProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`${NAV_ITEM_BASE} ${
        collapsed ? 'py-2 px-0' : 'py-2 px-3'
      } ${active ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}`}
    >
      <item.Icon
        size={16}
        className={`shrink-0 ${item.robotColor ? ROBOT_COLOR_TEXT[item.robotColor] : active ? 'opacity-100' : 'opacity-70'}`}
      />
      {item.robotColor != null && !collapsed && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ROBOT_COLOR_DOT[item.robotColor]}`} />
      )}
      {!collapsed && <span className="overflow-hidden text-ellipsis">{item.label}</span>}
    </Button>
  );
}
