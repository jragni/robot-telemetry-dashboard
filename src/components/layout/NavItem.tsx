import { NavLink } from 'react-router';

import type { NavItemProps } from './Header.types';

import { cn } from '@/lib/utils';

export function NavItem({ to, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'px-3 py-1 rounded text-xs font-mono font-medium uppercase tracking-wider transition-colors',
          isActive
            ? 'bg-primary/15 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        )
      }
    >
      {label}
    </NavLink>
  );
}
