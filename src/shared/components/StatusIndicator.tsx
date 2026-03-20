import type { StatusIndicatorProps } from './StatusIndicator.types';

import { cn } from '@/lib/utils';

const stateStyles: Record<
  StatusIndicatorProps['state'],
  { dot: string; text: string; label: string }
> = {
  connected: {
    dot: 'bg-status-connected',
    text: 'text-status-connected',
    label: 'Connected',
  },
  connecting: {
    dot: 'bg-status-connecting animate-pulse',
    text: 'text-status-connecting',
    label: 'Connecting',
  },
  disconnected: {
    dot: 'bg-status-disconnected',
    text: 'text-status-disconnected',
    label: 'Disconnected',
  },
  error: {
    dot: 'bg-status-error',
    text: 'text-status-error',
    label: 'Error',
  },
};

export function StatusIndicator({
  state,
  label,
  className,
}: StatusIndicatorProps) {
  const style = stateStyles[state];
  const displayLabel = label ?? style.label;

  return (
    <span
      className={cn('inline-flex items-center gap-1.5', className)}
      role="status"
      aria-label={displayLabel}
    >
      <span className={cn('size-2 rounded-full', style.dot)} />
      <span className={cn('text-xs font-mono', style.text)}>
        {displayLabel}
      </span>
    </span>
  );
}
