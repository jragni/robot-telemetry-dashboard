import type { DataCardProps } from './DataCard.types';
import { Show } from './Show';
import { StatusIndicator } from './StatusIndicator';

import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DataCard({
  title,
  children,
  status,
  className,
  headerActions,
}: DataCardProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden rounded-sm border border-border bg-card border-l-2 border-l-primary',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold tracking-[0.15em] uppercase text-primary">
            {title}
          </span>
          <Show when={status !== undefined}>
            <StatusIndicator state={status!} />
          </Show>
        </div>
        <Show when={headerActions !== undefined}>
          <div className="flex items-center gap-1">{headerActions}</div>
        </Show>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-3">{children}</div>
    </div>
  );
}
