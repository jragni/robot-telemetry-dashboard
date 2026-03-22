import { NavLink } from 'react-router';

import { cn } from '@/lib/utils';

export interface SidebarNavItemProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
  iconOnly?: boolean;
}

export function SidebarNavItem({
  to,
  label,
  icon,
  iconOnly = false,
}: SidebarNavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors',
          isActive
            ? 'bg-primary/15 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        )
      }
      aria-label={label}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {!iconOnly && <span>{label}</span>}
    </NavLink>
  );
}
