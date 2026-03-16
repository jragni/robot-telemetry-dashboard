import {
  Monitor,
  Radar,
  Activity,
  Gamepad2,
  List,
  BarChart3,
  Map,
  Wifi,
  Camera,
} from 'lucide-react';

import { PanelPlaceholder } from './components/PanelPlaceholder';
import type { PanelMeta, PanelTypeId } from './panel.types';

import { ControlWidget } from '@/features/control';
import { SlamMapWidget } from '@/features/slam';
import { DataPlotWidget } from '@/features/telemetry/data-plot';
import { DepthCameraWidget } from '@/features/telemetry/depth-camera';
import { ImuWidget } from '@/features/telemetry/imu';
import { LidarWidget } from '@/features/telemetry/lidar';
import { TopicListWidget } from '@/features/telemetry/topic-list';

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const PANEL_REGISTRY: Record<PanelTypeId, PanelMeta> = {
  'video-feed': {
    typeId: 'video-feed',
    title: 'Video Feed',
    description: 'Live camera stream from the robot.',
    defaultSize: { w: 6, h: 8, minW: 3, minH: 4 },
    icon: Monitor,
    component: (props) => PanelPlaceholder({ ...props, typeId: 'video-feed' }),
  },

  'lidar-view': {
    typeId: 'lidar-view',
    title: 'LiDAR View',
    description: 'Real-time LiDAR point cloud visualisation.',
    defaultSize: { w: 6, h: 8, minW: 3, minH: 4 },
    icon: Radar,
    component: LidarWidget,
  },

  'imu-display': {
    typeId: 'imu-display',
    title: 'IMU Display',
    description: 'Inertial measurement unit orientation and acceleration.',
    defaultSize: { w: 4, h: 6, minW: 2, minH: 3 },
    icon: Activity,
    component: ImuWidget,
  },

  'control-pad': {
    typeId: 'control-pad',
    title: 'Control Pad',
    description: 'Manual directional control input for the robot.',
    defaultSize: { w: 4, h: 6, minW: 2, minH: 4 },
    icon: Gamepad2,
    component: ControlWidget,
  },

  'topic-list': {
    typeId: 'topic-list',
    title: 'Topic List',
    description: 'Browse and inspect active ROS topics.',
    defaultSize: { w: 4, h: 6, minW: 2, minH: 3 },
    icon: List,
    component: TopicListWidget,
  },

  'data-plot': {
    typeId: 'data-plot',
    title: 'Data Plot',
    description: 'Time-series chart for numeric topic data.',
    defaultSize: { w: 6, h: 6, minW: 3, minH: 3 },
    icon: BarChart3,
    component: DataPlotWidget,
  },

  'depth-camera': {
    typeId: 'depth-camera',
    title: 'Depth Camera',
    description: 'Compressed depth image stream from the robot.',
    defaultSize: { w: 6, h: 8, minW: 3, minH: 4 },
    icon: Camera,
    component: DepthCameraWidget,
  },

  'map-view': {
    typeId: 'map-view',
    title: 'Map View',
    description: 'Occupancy grid and robot pose on the navigation map.',
    defaultSize: { w: 9, h: 14, minW: 4, minH: 6 },
    icon: Map,
    component: SlamMapWidget,
  },

  'connection-status': {
    typeId: 'connection-status',
    title: 'Connection Status',
    description: 'Live rosbridge WebSocket connection health.',
    defaultSize: { w: 4, h: 4, minW: 2, minH: 2 },
    icon: Wifi,
    component: (props) =>
      PanelPlaceholder({ ...props, typeId: 'connection-status' }),
  },
};

// ---------------------------------------------------------------------------
// Lookup helper
// ---------------------------------------------------------------------------

/**
 * Returns the {@link PanelMeta} for the given typeId.
 * Throws a descriptive error when the id is not registered so callers receive
 * a clear signal at development time rather than a silent `undefined`.
 */
export function getPanelMeta(typeId: PanelTypeId): PanelMeta {
  const meta = PANEL_REGISTRY[typeId];
  if (meta === undefined) {
    throw new Error(
      `[panel.registry] Unknown panel typeId: "${String(typeId)}". ` +
        `Valid ids are: ${Object.keys(PANEL_REGISTRY).join(', ')}`
    );
  }
  return meta;
}
