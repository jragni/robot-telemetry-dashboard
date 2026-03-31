import { useState } from 'react';
import type { ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { useControlPublisher } from '@/hooks/useControlPublisher/useControlPublisher';
import { WorkspaceGrid } from '@/features/workspace/components/WorkspaceGrid/WorkspaceGrid';
import { WORKSPACE_PANELS, VELOCITY_LIMITS } from '@/features/workspace/constants';
import type { ImuVariant } from '@/features/workspace/types/ImuPanel.types';
import { ImuVizSelect } from '@/features/workspace/components/ImuPanel/ImuVizSelect';
import { SystemStatusPanel } from '@/features/workspace/components/SystemStatusPanel';
import { ControlsPanel } from '@/features/workspace/components/ControlsPanel/ControlsPanel';
import { ImuPanel } from '@/features/workspace/components/ImuPanel/ImuPanel';

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
  const connected = robot?.status === 'connected';

  const panelContent: Record<string, ReactNode> = {
    status: robot ? (
      <SystemStatusPanel
        name={robot.name}
        url={robot.url}
        connected={connected}
        lastSeen={robot.lastSeen}
        uptimeSeconds={null}
        battery={null}
        rosGraph={null}
      />
    ) : null,
    controls: (
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
    imu: <ImuPanel roll={0} pitch={0} yaw={0} connected={connected} variant={imuVariant} />,
    camera: null,
    lidar: null,
    telemetry: null,
  };

  const panels = WORKSPACE_PANELS.map((panel) => ({
    id: panel.id,
    label: panel.label,
    icon: panel.icon,
    topicName: panel.topicName,
    content: panelContent[panel.id],
    footerActions:
      panel.id === 'imu' ? <ImuVizSelect value={imuVariant} onChange={setImuVariant} /> : undefined,
  }));

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

  return <WorkspaceGrid key={id} panels={panels} />;
}
