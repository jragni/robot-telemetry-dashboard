import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ConditionalRender } from '@/components/ConditionalRender';
import type { ExpandableRowProps } from '@/features/workspace/types/SystemStatusPanel.types';

/** ExpandableRow
 * @description Renders a status row that expands to show a list of names
 *  when clicked.
 * @param label - The row label (e.g., "NODES").
 * @param count - The numeric count to display.
 * @param names - The list of names revealed on expand.
 */
export function ExpandableRow({ label, count, names }: ExpandableRowProps) {
  const [expanded, setExpanded] = useState(false);
  const hasNames = names.length > 0;
  const Chevron = expanded ? ChevronDown : ChevronRight;

  return (
    <div>
      <button
        type="button"
        onClick={() => { setExpanded((v) => !v); }}
        className="flex items-center justify-between w-full text-left cursor-pointer hover:bg-surface-tertiary/50 rounded-sm px-1 -mx-1 transition"
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
          <ul className="ml-3 mt-1 mb-1 flex flex-col gap-0.5 max-h-24 overflow-y-auto border-l border-border pl-2 w-full min-w-0">
            {names.map((name) => (
              <li key={name} className="font-mono text-xs text-text-primary truncate w-full">{name}</li>
            ))}
          </ul>
        }
      />
    </div>
  );
}
