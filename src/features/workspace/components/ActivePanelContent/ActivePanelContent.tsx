import type { ComponentType } from 'react';

import type { MobileDataPanelId } from '@/features/workspace/types/RobotWorkspaceMobile.types';

import { CameraPanel } from '../CameraPanel';
import { ImuPanel } from '../ImuPanel';
import { LidarPanel } from '../LidarPanel';
import { SystemStatusPanel } from '../SystemStatusPanel';
import { TelemetryPanel } from '../TelemetryPanel';
import type { ActivePanelContentProps } from './ActivePanelContent.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- panels have different prop shapes, type safety is in propsMap
const MOBILE_PANEL_MAP: Record<MobileDataPanelId, ComponentType<any>> = {
  camera: CameraPanel,
  imu: ImuPanel,
  lidar: LidarPanel,
  status: SystemStatusPanel,
  telemetry: TelemetryPanel,
};

/** ActivePanelContent
 * @description Renders the active panel for the mobile workspace layout.
 *  Each panel self-subscribes to its ROS data via ros + connected props.
 *  Mobile-only component consumed by RobotWorkspaceMobile.
 * @prop activePanel - The currently selected panel tab ID.
 * @prop ros - Active roslib connection, or undefined when disconnected.
 * @prop connected - Whether the robot is currently connected.
 * @prop robot - Full robot connection record.
 * @prop selectedTopics - Per-panel selected ROS topic names.
 * @prop onConnect - Callback to initiate connection.
 * @prop onDisconnect - Callback to disconnect.
 */
export function ActivePanelContent({
  activePanel,
  connected,
  onConnect,
  onDisconnect,
  robot,
  ros,
  selectedTopics,
}: ActivePanelContentProps) {
  const propsMap: Record<MobileDataPanelId, Record<string, unknown>> = {
    camera: { connected, robotUrl: robot.url },
    imu: { connected, ros, topicName: selectedTopics.imu ?? '/imu/data' },
    lidar: { connected, ros, topicName: selectedTopics.lidar ?? '/scan' },
    status: { connected, onConnect, onDisconnect, robot, ros },
    telemetry: { connected, ros, topicName: selectedTopics.telemetry ?? '/odom' },
  };

  const PanelComponent = MOBILE_PANEL_MAP[activePanel];
  return <PanelComponent {...propsMap[activePanel]} />;
}
