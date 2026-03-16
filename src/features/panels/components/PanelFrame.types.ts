import type { PanelInstance, ViewId } from '@/features/panels/panel.types';

export interface PanelFrameProps {
  instance: PanelInstance;
  viewId: ViewId;
  editMode: boolean;
  robotId?: string;
}
