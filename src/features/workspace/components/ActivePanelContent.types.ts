import type { ImuPanelProps } from '@/features/workspace/types/ImuPanel.types';
import type { LidarPanelProps } from '@/features/workspace/types/LidarPanel.types';
import type { TelemetryPanelProps } from '@/features/workspace/types/TelemetryPanel.types';
import type { MobileDataPanelId } from '@/features/workspace/types/RobotWorkspaceMobile.types';

import type { CameraPanelProps } from './CameraPanel.types';
import type { SystemStatusPanelProps } from './SystemStatusPanel/SystemStatusPanel.types';

export interface ActivePanelContentProps {
  readonly activePanel: MobileDataPanelId;
  readonly cameraProps: CameraPanelProps;
  readonly imuProps: ImuPanelProps;
  readonly lidarProps: LidarPanelProps;
  readonly statusProps: SystemStatusPanelProps;
  readonly telemetryProps: TelemetryPanelProps;
}
