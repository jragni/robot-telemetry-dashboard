import { memo } from 'react';

import type { PanelFrameProps } from './PanelFrame.types';

import { DataCard } from '@/components/shared/DataCard';
import { getPanelMeta } from '@/features/panels/panel.registry';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const PanelFrame = memo(
  ({ instance, viewId: _viewId, robotId }: PanelFrameProps) => {
    const meta = getPanelMeta(instance.type);
    const PanelComponent = meta.component;

    return (
      <DataCard title={meta.title} className="h-full">
        <PanelComponent robotId={robotId} panelId={instance.id} />
      </DataCard>
    );
  }
);
