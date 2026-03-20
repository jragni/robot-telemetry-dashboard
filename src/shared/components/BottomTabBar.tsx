import { Gamepad2, LayoutDashboard, Map, Users } from 'lucide-react';
import { NavLink, useLocation } from 'react-router';

import type { TabItem } from './BottomTabBar.types';
import { Show } from './Show';

import { cn } from '@/lib/utils';

const TAB_ITEMS: TabItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
  { label: 'Fleet', to: '/fleet', icon: 'fleet' },
  { label: 'Map', to: '/map', icon: 'map' },
  { label: 'Pilot', to: '/pilot', icon: 'pilot' },
];

const ICON_MAP = {
  dashboard: LayoutDashboard,
  fleet: Users,
  map: Map,
  pilot: Gamepad2,
} as const;

export function BottomTabBar({ isMobile }: { isMobile: boolean }) {
  const location = useLocation();
  const isPilotMode = location.pathname.startsWith('/pilot/');

  return (
    <Show when={isMobile && !isPilotMode}>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex h-14 items-center justify-around border-t border-border bg-card"
        aria-label="Mobile navigation"
      >
        {TAB_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon];
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </Show>
  );
}
