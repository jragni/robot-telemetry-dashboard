import type { ReactNode } from 'react';

import type { ViewId } from '@/features/panels/panel.types';

export interface PanelContextMenuProps {
  children: ReactNode;
  viewId: ViewId;
  panelId?: string;
  panelTypeId?: string;
  onAddPanel: () => void;
  onResetLayout: () => void;
}
