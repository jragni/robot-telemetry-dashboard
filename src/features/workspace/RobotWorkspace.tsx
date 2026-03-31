import { useParams, Link } from 'react-router-dom';
import { Activity, Camera, Compass, Gamepad2, Radar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConditionalRender } from '@/components/ConditionalRender';
import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { useControlPublisher } from '@/hooks/useControlPublisher/useControlPublisher';
import { VELOCITY_LIMITS } from '@/features/workspace/constants';
import { useMinimizedPanels } from '@/features/workspace/hooks/useMinimizedPanels';
import { WorkspacePanel } from '@/features/workspace/components/WorkspacePanel';
import { SystemStatusPanel } from '@/features/workspace/components/SystemStatusPanel';
import { ControlsPanel } from '@/features/workspace/components/ControlsPanel/ControlsPanel';
import { ImuPanel } from '@/features/workspace/components/ImuPanel/ImuPanel';
import { LidarPanel } from '@/features/workspace/components/LidarPanel';

const PANELS = [
  { id: 'camera', label: 'Camera', icon: Camera },
  { id: 'lidar', label: 'LiDAR', icon: Radar },
  { id: 'status', label: 'Status', icon: Shield },
  { id: 'imu', label: 'IMU', icon: Compass },
  { id: 'controls', label: 'Controls', icon: Gamepad2 },
  { id: 'telemetry', label: 'Telemetry', icon: Activity },
] as const;

const PANEL_IDS = PANELS.map((p) => p.id);

const GRID_COL_MAP: Record<number, string> = {
  0: 'grid-cols-1',
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
};

/** RobotWorkspace
 * @description Renders the workspace page for a single robot with a 3x2 grid
 *  of panels. Supports minimize, maximize, and restore. Grid reflows
 *  dynamically based on visible panel count.
 */
export function RobotWorkspace() {
  const { id } = useParams<{ id: string }>();
  const robot = useConnectionStore((s) => (id ? s.robots[id] : undefined));
  const controls = useControlPublisher();
  const {
    isMinimized,
    isMaximized,
    minimize,
    restore,
    maximize,
    restoreAll,
    minimizedIds,
    maximizedId,
  } = useMinimizedPanels(PANEL_IDS);

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
  const visibleCount = PANEL_IDS.length - minimizedIds.size;
  const gridCols = maximizedId
    ? 'grid-cols-1'
    : (GRID_COL_MAP[Math.min(visibleCount, 3)] ?? 'grid-cols-3');

  return (
    <div className="flex flex-col h-full gap-3 p-4">
      <div className={`flex-1 grid gap-3 min-h-0 ${gridCols}`}>
        <ConditionalRender
          shouldRender={!isMinimized('camera')}
          Component={
            <WorkspacePanel
              label="Camera"
              icon={Camera}
              topicName="/camera/image_raw"
              onMinimize={() => {
                minimize('camera');
              }}
              onMaximize={() => {
                maximize('camera');
              }}
              onRestoreAll={restoreAll}
              maximized={isMaximized('camera')}
            >
              {null}
            </WorkspacePanel>
          }
        />

        <ConditionalRender
          shouldRender={!isMinimized('lidar')}
          Component={
            <WorkspacePanel
              label="LiDAR"
              icon={Radar}
              topicName="/scan"
              onMinimize={() => {
                minimize('lidar');
              }}
              onMaximize={() => {
                maximize('lidar');
              }}
              onRestoreAll={restoreAll}
              maximized={isMaximized('lidar')}
            >
              <LidarPanel points={[]} rangeMax={5} connected={connected} />
            </WorkspacePanel>
          }
        />

        <ConditionalRender
          shouldRender={!isMinimized('status')}
          Component={
            <WorkspacePanel
              label="System Status"
              icon={Shield}
              onMinimize={() => {
                minimize('status');
              }}
              onMaximize={() => {
                maximize('status');
              }}
              onRestoreAll={restoreAll}
              maximized={isMaximized('status')}
            >
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
          }
        />

        <ConditionalRender
          shouldRender={!isMinimized('imu')}
          Component={
            <WorkspacePanel
              label="IMU Attitude"
              icon={Compass}
              topicName="/imu/data"
              onMinimize={() => {
                minimize('imu');
              }}
              onMaximize={() => {
                maximize('imu');
              }}
              onRestoreAll={restoreAll}
              maximized={isMaximized('imu')}
            >
              <ImuPanel roll={0} pitch={0} yaw={0} connected={connected} />
            </WorkspacePanel>
          }
        />

        <ConditionalRender
          shouldRender={!isMinimized('controls')}
          Component={
            <WorkspacePanel
              label="Controls"
              icon={Gamepad2}
              topicName="/cmd_vel"
              onMinimize={() => {
                minimize('controls');
              }}
              onMaximize={() => {
                maximize('controls');
              }}
              onRestoreAll={restoreAll}
              maximized={isMaximized('controls')}
            >
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
          }
        />

        <ConditionalRender
          shouldRender={!isMinimized('telemetry')}
          Component={
            <WorkspacePanel
              label="Telemetry"
              icon={Activity}
              topicName="/odom"
              onMinimize={() => {
                minimize('telemetry');
              }}
              onMaximize={() => {
                maximize('telemetry');
              }}
              onRestoreAll={restoreAll}
              maximized={isMaximized('telemetry')}
            >
              {null}
            </WorkspacePanel>
          }
        />
      </div>

      <ConditionalRender
        shouldRender={minimizedIds.size > 0}
        Component={
          <nav aria-label="Minimized panels" className="flex items-center gap-1 shrink-0">
            {PANELS.filter((p) => isMinimized(p.id)).map((panel) => (
              <Button
                key={panel.id}
                variant="outline"
                size="sm"
                onClick={() => {
                  restore(panel.id);
                }}
                className="font-mono text-xs text-text-muted hover:text-text-primary cursor-pointer"
              >
                <panel.icon className="size-3" aria-hidden="true" />
                {panel.label}
              </Button>
            ))}
          </nav>
        }
      />
    </div>
  );
}
