import type { PanelContentProps } from '../types/panel-system.types';

export function MapWidgetPlaceholder({ panelId }: PanelContentProps) {
  return (
    <div
      data-testid={`widget-${panelId}`}
      className="flex h-full items-center justify-center text-slate-400 text-sm"
    >
      Map (SLAM) — coming in Phase 11
    </div>
  );
}
