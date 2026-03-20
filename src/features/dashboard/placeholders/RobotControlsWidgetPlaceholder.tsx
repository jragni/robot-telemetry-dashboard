import type { PanelContentProps } from '../types/panel-system.types';

export function RobotControlsWidgetPlaceholder({ panelId }: PanelContentProps) {
  return (
    <div
      data-testid={`widget-${panelId}`}
      className="flex h-full items-center justify-center text-slate-400 text-sm"
    >
      Robot Controls — coming in Phase 7
    </div>
  );
}
