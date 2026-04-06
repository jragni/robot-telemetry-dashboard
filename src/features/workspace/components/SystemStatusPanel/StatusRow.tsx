import { cn } from '@/lib/utils';
import type { StatusRowProps } from './SystemStatusPanel.types';

/** StatusRow
 * @description Renders a single key-value data row for the system status panel.
 * @param label - The data label.
 * @param value - The data value.
 * @param valueClass - Optional additional classes for the value element.
 */
export function StatusRow({ label, value, valueClass }: StatusRowProps) {
  return (
    <div className="flex justify-between">
      <dt className="font-sans text-xs text-text-muted">{label}</dt>
      <dd className={cn('font-mono text-xs tabular-nums text-text-primary', valueClass)}>
        {value}
      </dd>
    </div>
  );
}
