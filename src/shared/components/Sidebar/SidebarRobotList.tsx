import { NavLink } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRosStore } from '@/shared/stores/ros/ros.store';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

function statusVariant(state: string): BadgeVariant {
  if (state === 'connected') return 'default';
  if (state === 'error') return 'destructive';
  return 'secondary';
}

function statusLabel(state: string): string {
  if (state === 'connected') return 'connected';
  if (state === 'error') return 'error';
  return 'offline';
}

export function SidebarRobotList() {
  const connectionStates = useRosStore((s) => s.connectionStates);
  const robotIds = Object.keys(connectionStates);

  if (robotIds.length === 0) {
    return (
      <p className="px-2 py-1 text-xs text-muted-foreground">
        No robots connected
      </p>
    );
  }

  return (
    <ul className="space-y-0.5">
      {robotIds.map((id) => {
        const state = connectionStates[id]?.state ?? 'disconnected';
        return (
          <li key={id}>
            <NavLink
              to={`/robot/${id}`}
              data-testid="sidebar-robot-link"
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between gap-2 rounded px-2 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-foreground hover:bg-accent'
                )
              }
            >
              <span className="truncate font-mono text-xs">{id}</span>
              <Badge
                variant={statusVariant(state)}
                className="shrink-0 text-[10px]"
              >
                {statusLabel(state)}
              </Badge>
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
}
