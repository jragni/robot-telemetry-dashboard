import type { ExpandableRowListProps } from '@/features/workspace/types/SystemStatusPanel.types';

/** ExpandableRowList
 * @description Renders a scrollable list of names inside an expanded row.
 * @param names - The list of names to display.
 */
export function ExpandableRowList({ names }: ExpandableRowListProps) {
  return (
    <ul className="ml-3 mt-1 mb-1 max-h-32 overflow-y-auto scrollbar-thin border-l border-border pl-2">
      {names.map((name) => (
        <li key={name} className="font-mono text-xs text-text-primary leading-relaxed overflow-hidden text-ellipsis whitespace-nowrap">{name}</li>
      ))}
    </ul>
  );
}
