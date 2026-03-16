import type { ViewId } from '@/features/panels/panel.types';

export interface AddPanelDialogProps {
  viewId: ViewId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
