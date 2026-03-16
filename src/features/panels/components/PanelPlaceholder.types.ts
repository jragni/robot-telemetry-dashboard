import type { PanelComponentProps } from '../panel.types';

export interface PanelPlaceholderProps extends PanelComponentProps {
  /**
   * The panel type drives which icon and title are shown. When omitted the
   * component renders a generic fallback so callers can still render during
   * bootstrapping before a typeId is resolved.
   */
  typeId?: string;
}
