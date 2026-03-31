import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Activity, Camera, Compass, Gamepad2, Radar, Shield } from 'lucide-react';
import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { useControlPublisher } from '@/hooks/useControlPublisher/useControlPublisher';
import { VELOCITY_LIMITS } from '@/features/workspace/constants';
import type { ImuVariant } from '@/features/workspace/types/ImuPanel.types';
import type { PanelConfig } from '@/features/workspace/types/WorkspaceGrid.types';
import { WorkspaceGrid } from '@/features/workspace/components/WorkspaceGrid/WorkspaceGrid';
import { SystemStatusPanel } from '@/features/workspace/components/SystemStatusPanel';
import { ControlsPanel } from '@/features/workspace/components/ControlsPanel/ControlsPanel';
import { ImuPanel } from '@/features/workspace/components/ImuPanel/ImuPanel';
import { ImuVizSelect } from '@/features/workspace/components/ImuPanel/ImuVizSelect';

/** RobotWorkspace
 * @description Renders the workspace page for a single robot with
 *  6 configurable panels. Each panel handles its own connected/disconnected
 *  state internally.
 */
export function RobotWorkspace() {
  const { id } = useParams<{ id: string }>();
  const robot = useConnectionStore((s) => (id ? s.robots[id] : undefined));
  const [imuVariant, setImuVariant] = useState<ImuVariant>('attitude-compass');
  const controls = useControlPublisher();

  if (!robot) {
    return (
      <section
        aria-label="Robot not found"
        className="flex flex-col items-center justify-center h-full gap-4"
      >
        <p className="font-mono text-xs text-text-muted">Robot not found: {id}</p>
        <Link to="/fleet" className="font-mono text-xs text-accent hover:underline">
          Back to Fleet
        </Link>
      </section>
    );
  }

  const connected = robot.status === 'connected';

  const panels: PanelConfig[] = [
    {
      id: 'camera',
      label: 'Camera',
      icon: Camera,
      topicName: '/camera/image_raw',
      content: null,
    },
    {
      id: 'lidar',
      label: 'LiDAR',
      icon: Radar,
      topicName: '/scan',
      content: null,
    },
    {
      id: 'status',
      label: 'System Status',
      icon: Shield,
      content: (
        <SystemStatusPanel
          name={robot.name}
          url={robot.url}
          connected={connected}
          lastSeen={robot.lastSeen}
          uptimeSeconds={null}
          battery={null}
          rosGraph={null}
        />
      ),
    },
    {
      id: 'imu',
      label: 'IMU Attitude',
      icon: Compass,
      topicName: '/imu/data',
      content: <ImuPanel roll={0} pitch={0} yaw={0} connected={connected} variant={imuVariant} />,
      footerActions: <ImuVizSelect value={imuVariant} onChange={setImuVariant} />,
    },
    {
      id: 'controls',
      label: 'Controls',
      icon: Gamepad2,
      topicName: '/cmd_vel',
      content: (
        <ControlsPanel
          linearVelocity={controls.linearVelocity}
          angularVelocity={controls.angularVelocity}
          linearLimits={VELOCITY_LIMITS.linear}
          angularLimits={VELOCITY_LIMITS.angular}
          isActive={controls.isActive}
          connected={connected}
          onDirectionStart={controls.handleDirectionStart}
          onDirectionEnd={controls.handleDirectionEnd}
          onLinearVelocityChange={controls.handleLinearChange}
          onAngularVelocityChange={controls.handleAngularChange}
          onEmergencyStop={controls.handleEmergencyStop}
        />
      ),
    },
    {
      id: 'telemetry',
      label: 'Telemetry',
      icon: Activity,
      topicName: '/odom',
      content: null,
    },
  ];

  return <WorkspaceGrid key={id} panels={panels} />;
}
