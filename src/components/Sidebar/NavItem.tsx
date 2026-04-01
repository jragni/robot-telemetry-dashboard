import { Button } from '@/components/ui/button';
import { ConditionalRender } from '@/components/ConditionalRender';
import type { NavItemProps } from '@/types/Sidebar.types';
import {
  ROBOT_COLOR_DOT,
  ROBOT_COLOR_TEXT,
  NAV_ITEM_BASE,
  NAV_ITEM_ACTIVE,
  NAV_ITEM_INACTIVE,
} from './constants';

/** NavItem
 * @description Renders a single navigation item with icon, label, and active state.
 * @param item - Navigation item data (icon, label, path).
 * @param active - Whether the item is currently active.
 * @param collapsed - Whether the sidebar is in collapsed mode.
 * @param onClick - Callback invoked when the item is clicked.
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
      <ConditionalRender
        shouldRender={item.robotColor != null && !collapsed}
        Component={
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.robotColor ? ROBOT_COLOR_DOT[item.robotColor] : ''}`}
          />
        }
      />
      <ConditionalRender
        shouldRender={!collapsed}
        Component={<span className="overflow-hidden text-ellipsis">{item.label}</span>}
      />
    </Button>
  );
}
