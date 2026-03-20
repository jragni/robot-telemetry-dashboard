import type { PanelContentProps } from '../types/panel-system.types';

export function FleetStatusWidgetPlaceholder({ panelId }: PanelContentProps) {
  return (
    <div
      data-testid={`widget-${panelId}`}
      className="flex h-full items-center justify-center text-slate-400 text-sm"
    >
      Fleet Status — coming in Phase 10
    </div>
  );
}
