import type { StatusIndicatorProps } from './StatusIndicator.types';

import { cn } from '@/lib/utils';
import type { ConnectionState } from '@/types/connection.types';

// ---------------------------------------------------------------------------
// State → Tailwind class map
// Note: 'connected' intentionally has no pulse animation — defense UI research
// shows persistent pulse on steady-state signals causes operator habituation.
// ---------------------------------------------------------------------------

const STATE_CLASSES: Record<ConnectionState, string> = {
  connected: 'bg-status-nominal',
  connecting: 'bg-status-degraded animate-status-pulse-fast',
  disconnected: 'bg-status-offline',
  error: 'bg-status-critical',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StatusIndicator({
  state,
  label,
  className,
}: StatusIndicatorProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        data-slot="status-dot"
        className={cn('rounded-full w-2 h-2 shrink-0', STATE_CLASSES[state])}
      />
      {label !== undefined && (
        <span
          data-slot="status-label"
          className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
        >
          {label}
        </span>
      )}
    </span>
  );
}
