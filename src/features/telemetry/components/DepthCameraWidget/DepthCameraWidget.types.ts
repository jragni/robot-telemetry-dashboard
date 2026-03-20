import type { ColormapType } from '../../utils/applyColormap';

export interface DepthCameraWidgetProps {
  robotId: string;
  panelId: string;
  topicName: string;
  colormap?: ColormapType;
  showFps?: boolean;
}
