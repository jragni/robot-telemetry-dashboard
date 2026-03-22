import { Map, Settings } from 'lucide-react';

import type { SidebarProps } from './Sidebar.types';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarRobotList } from './SidebarRobotList';
import { ThemeDropdown } from './ThemeDropdown';

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside
      className={`flex h-full flex-col overflow-y-auto border-r border-border bg-card ${className ?? ''}`}
      aria-label="Sidebar"
    >
      {/* Fleet section */}
      <div className="flex-1 overflow-y-auto p-2">
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Fleet
        </p>
        <SidebarRobotList />
      </div>

      {/* Bottom nav */}
      <div className="border-t border-border p-2 space-y-0.5">
        <SidebarNavItem to="/map" label="Map" icon={<Map size={14} />} />
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Settings size={14} className="shrink-0" />
          <span>Settings</span>
        </button>
        <ThemeDropdown />
      </div>
    </aside>
  );
}
