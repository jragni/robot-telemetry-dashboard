import { getPanelMeta } from '../panel.registry';
import type { PanelTypeId } from '../panel.types';

import type { PanelPlaceholderProps } from './PanelPlaceholder.types';

import { Show } from '@/components/shared/Show';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PanelPlaceholder({ panelId, typeId }: PanelPlaceholderProps) {
  // Resolve metadata only when typeId is a known PanelTypeId.  We attempt the
  // lookup and fall back gracefully rather than crashing at display time.
  let title = 'Panel';
  let Icon: React.ComponentType<{ size?: number; className?: string }> | null =
    null;

  if (typeId !== undefined) {
    try {
      // getPanelMeta throws on unknown ids — wrap defensively.
      const meta = getPanelMeta(typeId as PanelTypeId);
      title = meta.title;
      Icon = meta.icon as React.ComponentType<{
        size?: number;
        className?: string;
      }>;
    } catch {
      title = typeId;
    }
  }

  return (
    <div
      data-panel-id={panelId}
      className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground"
    >
      <Show when={Icon !== null}>
        {Icon ? <Icon size={32} className="opacity-40" /> : null}
      </Show>
      <span className="text-xs font-mono font-semibold tracking-widest uppercase opacity-60">
        {title}
      </span>
    </div>
  );
}
