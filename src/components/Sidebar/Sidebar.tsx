import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { Button } from '@/components/ui/button';
import type { NavItemData, SidebarProps } from '@/types/Sidebar.types';

import { NavItem } from './NavItem';
import { SYSTEM_ITEMS } from './constants';

/** Sidebar
 * @description Renders the left sidebar with fleet robot list and system navigation.
 * @param collapsed - Whether the sidebar is in collapsed mode.
 * @param onToggleCollapse - Callback invoked to toggle sidebar collapse state.
 */
export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const storeRobots = useConnectionStore((s) => s.robots);
  const robots: NavItemData[] = Object.values(storeRobots).map((r) => ({
    Icon: Bot,
    label: r.name,
    path: `/robot/${r.id}`,
    status: r.status,
    robotColor: r.color,
  }));

  return (
    <aside
      aria-label="Main navigation"
      className="bg-surface-primary border-r border-border flex flex-col overflow-hidden shadow-glow-right h-full"
    >
      <nav className="flex-1 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
            <h2 className="font-sans text-xs font-semibold text-text-muted uppercase tracking-widest px-3 pt-3.5 pb-1.5">
              Fleet
            </h2>
        )}
        {robots.length > 0 && (
            <>
              {robots.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  active={location.pathname === item.path}
                  collapsed={collapsed}
                  onClick={() => {
                    void navigate(item.path);
                  }}
                />
              ))}
            </>
        )}
        {robots.length === 0 && !collapsed && (
            <p className="px-3 py-2 font-mono text-xs text-text-muted">
              No robots
            </p>
        )}

        {!collapsed && (
            <h2 className="font-sans text-xs font-semibold text-text-muted uppercase tracking-widest px-3 pt-3.5 pb-1.5">
              System
            </h2>
        )}
        {SYSTEM_ITEMS.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            active={location.pathname === item.path}
            collapsed={collapsed}
            onClick={() => {
              void navigate(item.path);
            }}
          />
        ))}
      </nav>

      <Button
        variant="ghost"
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="w-full h-8 rounded-none border-t border-border text-text-muted font-mono text-xs hover:text-accent hover:bg-surface-tertiary shrink-0"
      >
        {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        {!collapsed && <span>Collapse</span>}
      </Button>
    </aside>
  );
}
