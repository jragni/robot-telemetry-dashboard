import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SidebarProps } from './Sidebar.types';
import { useConnectionStore } from '../stores/connection/useConnectionStore';
import {
  SYSTEM_ITEMS,
  ROBOT_COLOR_DOT,
  ROBOT_COLOR_TEXT,
} from './Sidebar.constants';
import type { NavItemData } from './Sidebar.constants';

function NavItem({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: NavItemData;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-2 w-full text-left font-sans text-sm cursor-pointer whitespace-nowrap overflow-hidden border-none transition-all duration-150 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[-2px] ${
        collapsed ? 'justify-center py-2 px-0' : 'py-2 px-3'
      } ${
        active
          ? 'text-accent bg-accent-subtle'
          : 'text-text-secondary bg-transparent hover:bg-accent-subtle hover:text-text-primary'
      }`}
    >
      <item.Icon
        size={16}
        className={`shrink-0 ${item.robotColor ? ROBOT_COLOR_TEXT[item.robotColor] : active ? 'opacity-100' : 'opacity-70'}`}
      />
      {item.robotColor != null && !collapsed && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${ROBOT_COLOR_DOT[item.robotColor]}`}
        />
      )}
      {!collapsed && (
        <span className="overflow-hidden text-ellipsis">{item.label}</span>
      )}
    </button>
  );
}

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
      className="bg-surface-primary border-r border-border flex flex-col overflow-hidden shadow-[inset_-1px_0_0_0_var(--color-surface-glow)] h-full"
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <div className="font-sans text-xs font-semibold text-text-muted uppercase tracking-widest px-3 pt-3.5 pb-1.5">
            Fleet
          </div>
        )}
        {robots.length > 0 ? (
          robots.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              active={location.pathname === item.path}
              collapsed={collapsed}
              onClick={() => {
                void navigate(item.path);
              }}
            />
          ))
        ) : !collapsed ? (
          <div className="px-3 py-2 font-mono text-xs text-text-muted">
            No robots
          </div>
        ) : null}

        {!collapsed && (
          <div className="font-sans text-xs font-semibold text-text-muted uppercase tracking-widest px-3 pt-3.5 pb-1.5">
            System
          </div>
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
      </div>

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
