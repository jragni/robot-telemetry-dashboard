import { NavLink } from 'react-router';

import type { NavItem } from './Header.types';
import { Show } from './Show';

import { cn } from '@/lib/utils';

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Fleet', to: '/fleet' },
  { label: 'Map', to: '/map' },
];

export function Header({ isMobile }: { isMobile: boolean }) {
  return (
    <header className="flex h-12 items-center border-b border-border bg-card px-4">
      <h1 className="font-mono text-sm font-bold uppercase tracking-widest text-foreground">
        Robot Telemetry Dashboard
      </h1>

      <Show when={!isMobile}>
        <nav className="ml-8 flex gap-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </Show>
    </header>
  );
}
