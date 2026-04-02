import { ChevronDown, ChevronRight } from 'lucide-react';
import { ConditionalRender } from '@/components/ConditionalRender';
import type { ExpandableRowProps } from '@/features/workspace/types/SystemStatusPanel.types';

/** ExpandableRow
 * @description Renders a status row that expands to show a list of names
 *  when toggled. Controlled by parent for accordion behavior.
 * @param label - The row label (e.g., "NODES").
 * @param count - The numeric count to display.
 * @param names - The list of names revealed on expand.
 * @param expanded - Whether this row is currently expanded.
 * @param onToggle - Callback to toggle expand/collapse.
 */
export function ExpandableRow({ label, count, names, expanded, onToggle }: ExpandableRowProps) {
  const hasNames = names.length > 0;
  const Chevron = expanded ? ChevronDown : ChevronRight;

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left cursor-pointer hover:bg-surface-tertiary/50 rounded-sm px-1 -mx-1 transition focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        aria-expanded={expanded}
        disabled={!hasNames}
      >
        <span className="font-sans text-xs text-text-secondary uppercase tracking-wide">{label}</span>
        <span className="flex items-center gap-1 font-mono text-xs text-text-primary tabular-nums">
          {String(count)}
          <ConditionalRender
            shouldRender={hasNames}
            Component={<Chevron className="size-3 text-text-primary" />}
          />
        </span>
      </button>
      <ConditionalRender
        shouldRender={expanded}
        Component={
          <ul className="ml-3 mt-1 mb-1 max-h-32 overflow-y-auto scrollbar-thin border-l border-border pl-2">
            {names.map((name) => (
              <li key={name} className="font-mono text-xs text-text-primary leading-relaxed overflow-hidden text-ellipsis whitespace-nowrap">{name}</li>
            ))}
          </ul>
        }
      />
    </div>
  );
}
