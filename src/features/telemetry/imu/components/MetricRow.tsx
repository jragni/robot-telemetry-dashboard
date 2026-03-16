import type { MetricRowProps } from './ImuDigitalView.types';

import { cn } from '@/lib/utils';

export function MetricRow({
  label,
  value,
  unit,
  valueClassName,
}: MetricRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-xs text-muted-foreground w-24 shrink-0">
        {label}
      </span>
      <span className={cn('font-mono text-xs tabular-nums', valueClassName)}>
        {value}
        <span className="ml-1 text-muted-foreground">{unit}</span>
      </span>
    </div>
  );
}
