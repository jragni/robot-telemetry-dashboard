import { GripVertical, X } from 'lucide-react';
import { memo, useCallback } from 'react';

import { DataCard } from '@/components/shared/DataCard';
import { Button } from '@/components/ui/button';
import { getPanelMeta } from '@/features/panels/panel.registry';
import type { PanelInstance, ViewId } from '@/features/panels/panel.types';
import { useLayoutStore } from '@/stores/layout.store';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PanelFrameProps {
  instance: PanelInstance;
  viewId: ViewId;
  editMode: boolean;
  robotId?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const PanelFrame = memo(
  ({ instance, viewId, editMode, robotId }: PanelFrameProps) => {
    const meta = getPanelMeta(instance.type);
    const PanelComponent = meta.component;

    const handleRemove = useCallback(() => {
      useLayoutStore.getState().removePanel(viewId, instance.id);
    }, [viewId, instance.id]);

    // Build header actions that appear when in edit mode
    const headerActions = editMode ? (
      <>
        {/* Drag handle — react-grid-layout targets elements with the
          draggableHandle selector applied via PanelGrid */}
        <div
          className="panel-drag-handle cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground transition-colors p-0.5"
          aria-label="Drag to reposition panel"
        >
          <GripVertical size={14} />
        </div>

        {/* Remove panel */}
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleRemove}
          aria-label={`Remove ${meta.title} panel`}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <X size={12} />
        </Button>
      </>
    ) : undefined;

    return (
      <DataCard
        title={meta.title}
        headerActions={headerActions}
        className="h-full"
      >
        <PanelComponent robotId={robotId} panelId={instance.id} />
      </DataCard>
    );
  }
);
