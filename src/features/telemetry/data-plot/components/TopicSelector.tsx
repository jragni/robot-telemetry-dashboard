import type { TopicSelectorProps } from './DataPlotWidget.types';

import { useRosStore } from '@/stores/ros/ros.store';

export function TopicSelector({
  robotId,
  selected,
  onSelect,
}: TopicSelectorProps) {
  const topics = useRosStore((s) => (robotId ? s.getTopics(robotId) : []));

  return (
    <select
      aria-label="Select topic to plot"
      value={selected?.name ?? ''}
      onChange={(e) => {
        const t = topics.find((x) => x.name === e.target.value);
        onSelect(t ?? null);
      }}
      className="rounded border border-border/50 bg-muted/30 px-2 py-0.5 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
    >
      <option value="">— select topic —</option>
      {topics.map((t) => (
        <option key={t.name} value={t.name}>
          {t.name}
        </option>
      ))}
    </select>
  );
}
