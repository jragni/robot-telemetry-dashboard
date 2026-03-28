import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bot,
  Map,
  Play,
  Settings,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import type { SidebarProps } from './Sidebar.types';
import type { LucideIcon } from 'lucide-react';

interface NavItemData {
  readonly Icon: LucideIcon;
  readonly label: string;
  readonly path: string;
  readonly status?: 'nominal' | 'caution' | 'critical' | 'offline';
}

const FLEET_ITEMS: NavItemData[] = [];

const SYSTEM_ITEMS: NavItemData[] = [
  { Icon: Map, label: 'Map', path: '/map' },
  { Icon: Play, label: 'Try Demo', path: '/demo' },
  { Icon: Settings, label: 'Settings', path: '/settings' },
];

const STATUS_BG: Record<string, string> = {
  nominal: 'bg-status-nominal',
  caution: 'bg-status-caution',
  critical: 'bg-status-critical',
  offline: 'bg-status-offline',
};

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
        collapsed ? 'justify-center py-2 px-0' : 'py-[7px] px-3'
      } ${
        active
          ? 'text-accent bg-accent-subtle'
          : 'text-text-secondary bg-transparent hover:bg-accent-subtle hover:text-text-primary'
      }`}
    >
      <item.Icon
        size={16}
        className={`shrink-0 ${active ? 'opacity-100' : 'opacity-70'}`}
      />
      {item.status != null && !collapsed && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_BG[item.status] ?? 'bg-status-offline'} ${item.status === 'nominal' ? 'animate-pulse' : ''}`}
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

  // TODO: Read from connection store once it exists
  const robots: NavItemData[] = FLEET_ITEMS.map((item) => ({
    ...item,
    Icon: Bot,
  }));

  return (
    <aside
      aria-label="Main navigation"
      className="bg-surface-primary border-r border-border flex flex-col overflow-hidden shadow-[inset_-1px_0_0_0_var(--color-surface-glow)] h-full"
    >
      {/* Scrollable nav content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Fleet section */}
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

        {/* System section */}
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

      {/* Add Robot button */}
      <button
        type="button"
        title={collapsed ? 'Add Robot' : undefined}
        className={`flex items-center gap-2 font-mono text-xs font-semibold text-accent bg-transparent border border-accent rounded-sm cursor-pointer whitespace-nowrap overflow-hidden uppercase tracking-wide transition-colors duration-200 hover:bg-accent-subtle focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${
          collapsed
            ? 'justify-center p-2 mx-1 my-1.5'
            : 'px-2.5 py-[7px] mx-2 my-2'
        }`}
      >
        <Plus size={16} className="shrink-0" />
        {!collapsed && <span>Add Robot</span>}
      </button>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="w-full h-8 flex items-center justify-center gap-1.5 bg-surface-secondary border-t border-border text-text-muted cursor-pointer font-mono text-xs transition-all duration-200 shrink-0 hover:text-accent hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[-2px]"
      >
        {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
}
