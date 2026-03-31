import { useParams, Link } from 'react-router-dom';
import { Activity, Camera, Compass, Gamepad2, Radar, Shield } from 'lucide-react';
import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { useControlPublisher } from '@/hooks/useControlPublisher/useControlPublisher';
import { VELOCITY_LIMITS } from '@/features/workspace/constants';
import { WorkspacePanel } from '@/features/workspace/components/WorkspacePanel';
import { SystemStatusPanel } from '@/features/workspace/components/SystemStatusPanel';
import { ControlsPanel } from '@/features/workspace/components/ControlsPanel/ControlsPanel';
import { ImuPanel } from '@/features/workspace/components/ImuPanel/ImuPanel';

/** RobotWorkspace
 * @description Renders the workspace page for a single robot with a 3x2 grid
 *  of panels. Each panel is rendered explicitly with its own props.
 */
export function RobotWorkspace() {
  const { id } = useParams<{ id: string }>();
  const robot = useConnectionStore((s) => (id ? s.robots[id] : undefined));
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

  return (
    <div className="grid grid-cols-3 gap-3 p-4 h-full">
      <WorkspacePanel label="Camera" icon={Camera} topicName="/camera/image_raw">
        {null}
      </WorkspacePanel>

      <WorkspacePanel label="LiDAR" icon={Radar} topicName="/scan">
        {null}
      </WorkspacePanel>

      <WorkspacePanel label="System Status" icon={Shield}>
        <SystemStatusPanel
          name={robot.name}
          url={robot.url}
          connected={connected}
          lastSeen={robot.lastSeen}
          uptimeSeconds={null}
          battery={null}
          rosGraph={null}
        />
      </WorkspacePanel>

      <WorkspacePanel label="IMU Attitude" icon={Compass} topicName="/imu/data">
        <ImuPanel roll={0} pitch={0} yaw={0} connected={connected} />
      </WorkspacePanel>

      <WorkspacePanel label="Controls" icon={Gamepad2} topicName="/cmd_vel">
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
      </WorkspacePanel>

      <WorkspacePanel label="Telemetry" icon={Activity} topicName="/odom">
        {null}
      </WorkspacePanel>
    </div>
  );
}
