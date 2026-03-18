import { X } from 'lucide-react';
import { memo, useCallback } from 'react';

import type { PanelFrameProps } from './PanelFrame.types';

import { DataCard } from '@/components/shared/DataCard';
import { Button } from '@/components/ui/button';
import { getPanelMeta } from '@/features/panels/panel.registry';
import { useLayoutStore } from '@/stores/layout/layout.store';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const PanelFrame = memo(
  ({ instance, viewId, robotId }: PanelFrameProps) => {
    const meta = getPanelMeta(instance.type);
    const PanelComponent = meta.component;

    const handleRemove = useCallback(() => {
      useLayoutStore.getState().removePanel(viewId, instance.id);
    }, [viewId, instance.id]);

    const headerActions = (
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handleRemove}
        aria-label={`Remove ${meta.title} panel`}
        className="panel-action-button opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      >
        <X size={12} />
      </Button>
    );

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
