import type { CameraPanelProps } from './CameraPanel.types';
import type { ImuPanelProps } from './ImuPanel.types';
import type { LidarPanelProps } from './LidarPanel.types';
import type { SystemStatusPanelProps } from './SystemStatusPanel.types';
import type { TelemetryPanelProps } from './TelemetryPanel.types';
import type { MobileDataPanelId } from './RobotWorkspaceMobile.types';

export interface ActivePanelContentProps {
  readonly activePanel: MobileDataPanelId;
  readonly cameraProps: CameraPanelProps;
  readonly imuProps: ImuPanelProps;
  readonly lidarProps: LidarPanelProps;
  readonly statusProps: SystemStatusPanelProps;
  readonly telemetryProps: TelemetryPanelProps;
}
