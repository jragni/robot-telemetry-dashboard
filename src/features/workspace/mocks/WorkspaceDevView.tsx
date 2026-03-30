import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Camera,
  Compass,
  Gamepad2,
  Radar,
  Shield,
} from 'lucide-react';
import { WorkspaceGrid } from '../components/WorkspaceGrid';
import type { PanelConfig } from '../components/WorkspaceGrid';
import { MockCamera } from './MockCamera';
import { MockLidar } from './MockLidar';
import { MockControls } from './MockControls';
import { MockTelemetry } from './MockTelemetry';
import { AnimatedMockImu } from './MockImu';
import { MockSystemStatus } from './MockSystemStatus';

/**
 * @description WorkspaceDevView — Renders the dev preview of the complete workspace layout
 *  with all six mock panels.
 */
export function WorkspaceDevView() {
  const [mockNow] = useState(() => Date.now());

  const panels: PanelConfig[] = useMemo(
    () => [
      {
        id: 'camera',
        label: 'Camera',
        icon: Camera,
        topicName: '/camera/image_raw',
        content: <MockCamera />,
      },
      {
        id: 'lidar',
        label: 'LiDAR',
        icon: Radar,
        topicName: '/scan',
        content: <MockLidar />,
      },
      {
        id: 'status',
        label: 'System Status',
        icon: Shield,
        content: (
          <MockSystemStatus
            name="Atlas-01"
            url="ws://192.168.1.100:9090"
            lastSeen={mockNow}
          />
        ),
      },
      {
        id: 'imu',
        label: 'IMU Attitude',
        icon: Compass,
        topicName: '/imu/data',
        content: <AnimatedMockImu />,
      },
      {
        id: 'controls',
        label: 'Controls',
        icon: Gamepad2,
        content: <MockControls />,
      },
      {
        id: 'telemetry',
        label: 'Telemetry',
        icon: Activity,
        topicName: '/odom',
        content: <MockTelemetry />,
      },
    ],
    [mockNow],
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <h2 className="font-sans text-xl font-semibold text-text-primary mb-2">
          Workspace Preview
        </h2>
        <nav className="flex gap-3 font-mono text-xs">
          <Link
            to="/dev/components"
            className="text-text-muted hover:text-accent transition-colors pb-1"
          >
            Components
          </Link>
          <span className="text-accent border-b border-accent pb-1">
            Workspace
          </span>
        </nav>
      </div>

      <div className="flex-1 min-h-0">
        <WorkspaceGrid panels={panels} />
      </div>
    </div>
  );
}
