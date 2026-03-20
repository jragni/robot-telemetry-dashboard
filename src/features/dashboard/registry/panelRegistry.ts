import { DataPlotWidgetPanel } from '../panels/DataPlotWidgetPanel';
import { DepthCameraWidgetPanel } from '../panels/DepthCameraWidgetPanel';
import { ImuWidgetPanel } from '../panels/ImuWidgetPanel';
import { LidarWidgetPanel } from '../panels/LidarWidgetPanel';
import { TopicListWidgetPanel } from '../panels/TopicListWidgetPanel';
import { AlertsWidgetPlaceholder } from '../placeholders/AlertsWidgetPlaceholder';
import { FleetStatusWidgetPlaceholder } from '../placeholders/FleetStatusWidgetPlaceholder';
import { MapWidgetPlaceholder } from '../placeholders/MapWidgetPlaceholder';
import { VideoWidgetPlaceholder } from '../placeholders/VideoWidgetPlaceholder';
import type { PanelRegistryEntry } from '../types/panel-system.types';

import { ControlWidget } from '@/features/pilot/components/ControlWidget/ControlWidget';

export const panelRegistry: PanelRegistryEntry[] = [
  {
    widgetId: 'map',
    label: 'Map (SLAM)',
    description: 'SLAM occupancy grid map with robot position overlay',
    component: MapWidgetPlaceholder,
    availableInModes: ['dashboard', 'engineer'],
    defaultSize: { w: 6, h: 8 },
    minSize: { w: 4, h: 4 },
    isSovereign: true,
  },
  {
    widgetId: 'video',
    label: 'Video Feed',
    description: 'Live WebRTC video stream from robot camera',
    component: VideoWidgetPlaceholder,
    availableInModes: ['dashboard', 'pilot', 'engineer'],
    defaultSize: { w: 4, h: 6 },
    minSize: { w: 2, h: 2 },
    isSovereign: true,
  },
  {
    widgetId: 'fleet-status',
    label: 'Fleet Status',
    description: 'Overview of all connected robots and their states',
    component: FleetStatusWidgetPlaceholder,
    availableInModes: ['dashboard', 'engineer'],
    defaultSize: { w: 3, h: 4 },
    minSize: { w: 2, h: 2 },
  },
  {
    widgetId: 'alerts',
    label: 'Alerts',
    description: 'Connection and system alerts',
    component: AlertsWidgetPlaceholder,
    availableInModes: ['dashboard', 'engineer'],
    defaultSize: { w: 3, h: 4 },
    minSize: { w: 2, h: 2 },
  },
  {
    widgetId: 'robot-controls',
    label: 'Robot Controls',
    description: 'D-pad, velocity sliders, and emergency stop controls',
    component: ControlWidget,
    availableInModes: ['pilot', 'engineer'],
    defaultSize: { w: 12, h: 3 },
    minSize: { w: 6, h: 2 },
  },
  {
    widgetId: 'imu',
    label: 'IMU',
    description:
      'Inertial measurement unit data — orientation, acceleration, angular velocity',
    component: ImuWidgetPanel,
    availableInModes: ['pilot', 'engineer'],
    defaultSize: { w: 3, h: 3 },
    minSize: { w: 2, h: 2 },
  },
  {
    widgetId: 'lidar',
    label: 'LiDAR',
    description: 'LiDAR point cloud scan visualization',
    component: LidarWidgetPanel,
    availableInModes: ['engineer'],
    defaultSize: { w: 4, h: 6 },
    minSize: { w: 2, h: 2 },
  },
  {
    widgetId: 'data-plot',
    label: 'Data Plot',
    description: 'Time series plot for any numeric ROS topic field',
    component: DataPlotWidgetPanel,
    availableInModes: ['pilot', 'engineer'],
    defaultSize: { w: 6, h: 3 },
    minSize: { w: 3, h: 2 },
  },
  {
    widgetId: 'topic-list',
    label: 'Topic List',
    description: 'Discover and inspect all available ROS topics',
    component: TopicListWidgetPanel,
    availableInModes: ['pilot', 'engineer'],
    defaultSize: { w: 3, h: 3 },
    minSize: { w: 2, h: 2 },
  },
  {
    widgetId: 'depth-camera',
    label: 'Depth Camera',
    description: 'Depth camera visualization with colormap',
    component: DepthCameraWidgetPanel,
    availableInModes: ['engineer'],
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 2, h: 2 },
  },
];
