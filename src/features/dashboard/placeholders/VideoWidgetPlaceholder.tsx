import type { PanelContentProps } from '../types/panel-system.types';

export function VideoWidgetPlaceholder({ panelId }: PanelContentProps) {
  return (
    <div
      data-testid={`widget-${panelId}`}
      className="flex h-full items-center justify-center bg-black text-slate-400 text-sm"
    >
      Video Feed — coming in Phase 8
    </div>
  );
}
