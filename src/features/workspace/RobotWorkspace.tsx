import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Activity, Camera, Compass, Gamepad2, Radar, Shield } from 'lucide-react';

import { useBatterySubscription } from '@/hooks/useBatterySubscription';
import { useConnectionUptime } from '@/hooks/useConnectionUptime';
import { useControlPublisher } from '@/hooks/useControlPublisher/useControlPublisher';
import { useImuSubscription } from '@/hooks/useImuSubscription';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useLidarSubscription } from '@/hooks/useLidarSubscription';
import { useRobotConnection } from '@/hooks/useRobotConnection';
import { useRosGraph } from '@/hooks/useRosGraph';
import { useRosTopics } from '@/hooks/useRosTopics';
import { useWebRtcStream } from '@/hooks/useWebRtcStream/useWebRtcStream';
import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { Button } from '@/components/ui/button';
import { VELOCITY_LIMITS } from '@/constants/controls';
import { isPanelId } from '@/types/panel.types';
import type { PanelId } from '@/types/panel.types';

import { useMinimizedPanels } from './hooks/useMinimizedPanels';
import { useTelemetrySubscription } from './hooks/useTelemetrySubscription';
import { CameraPanel } from './components/CameraPanel';
import { ControlsPanel } from './components/ControlsPanel/ControlsPanel';
import { ImuPanel } from './components/ImuPanel/ImuPanel';
import { LidarPanel } from './components/LidarPanel/LidarPanel';
import { RobotWorkspaceMobile } from './components/RobotWorkspaceMobile';
import { SystemStatusPanel } from './components/SystemStatusPanel/SystemStatusPanel';
import { TelemetryPanel } from './components/TelemetryPanel';
import { WorkspacePanel } from './components/WorkspacePanel';
import {
  DEFAULT_PANEL_TOPICS,
  GRID_COL_MAP,
  PANEL_TOPIC_TYPES,
  TELEMETRY_TIME_WINDOW_MS,
  WORKSPACE_PANEL_IDS,
  WORKSPACE_PANEL_META,
} from './constants';

/** RobotWorkspace
 * @description Renders the workspace page for a single robot with a 3x2 grid
 *  of panels. Supports minimize, maximize, and restore. Subscribes to real
 *  ROS topics when connected.
 */
export function RobotWorkspace() {
  const { id } = useParams<{ id: string }>();
  const { robot, connected, ros, connect, disconnect } = useRobotConnection(id);
  const rosGraph = useRosGraph(ros);
  const availableTopics = useRosTopics(ros);
  const battery = useBatterySubscription(ros, availableTopics);
  const uptimeSeconds = useConnectionUptime(id, connected);
  const { videoRef } = useWebRtcStream({ connected, enabled: connected, url: robot?.url ?? '' });

  const selectedTopics = robot?.selectedTopics ?? DEFAULT_PANEL_TOPICS;
  const setRobotTopic = useConnectionStore((s) => s.setRobotTopic);
  const isMobile = useIsMobile();
  const controls = useControlPublisher({ ros: isMobile ? undefined : ros, topicName: selectedTopics.controls });

  const setTopic = useCallback((panelId: PanelId, topicName: string) => {
    if (id) setRobotTopic(id, panelId, topicName);
  }, [id, setRobotTopic]);

  const lidar = useLidarSubscription(ros, selectedTopics.lidar ?? '/scan');
  const imu = useImuSubscription(ros, selectedTopics.imu ?? '/imu/data');
  // Look up the message type for the selected telemetry topic
  const telemetryTopicType = availableTopics.find((t) => t.name === selectedTopics.telemetry)?.type ?? 'nav_msgs/msg/Odometry';
  const telemetrySeries = useTelemetrySubscription(ros, selectedTopics.telemetry ?? '/odom', telemetryTopicType);

  const filteredTopics = useMemo(() => ({
    camera: availableTopics.filter((t) => PANEL_TOPIC_TYPES.camera?.includes(t.type)),
    controls: availableTopics.filter((t) => PANEL_TOPIC_TYPES.controls?.includes(t.type)),
    imu: availableTopics.filter((t) => PANEL_TOPIC_TYPES.imu?.includes(t.type)),
    lidar: availableTopics.filter((t) => PANEL_TOPIC_TYPES.lidar?.includes(t.type)),
    telemetry: availableTopics.filter((t) => PANEL_TOPIC_TYPES.telemetry?.includes(t.type)),
  }), [availableTopics]);

  // Auto-select first valid topic per panel when topics are discovered
  const autoSelectedRef = useRef(false);
  useEffect(() => {
    if (!id || availableTopics.length === 0 || autoSelectedRef.current) return;
    autoSelectedRef.current = true;

    for (const [panelId, topics] of Object.entries(filteredTopics)) {
      if (!isPanelId(panelId) || topics.length === 0) continue;
      const current = selectedTopics[panelId];
      const currentExists = topics.some((t) => t.name === current);
      const firstTopic = topics[0];
      if (!currentExists && firstTopic) {
        setRobotTopic(id, panelId, firstTopic.name);
      }
    }
  }, [availableTopics, filteredTopics, id, selectedTopics, setRobotTopic]);

  // Reset auto-select flag when robot changes
  useEffect(() => {
    autoSelectedRef.current = false;
  }, [id]);

  const {
    isMinimized,
    isMaximized,
    minimize,
    restore,
    maximize,
    restoreAll,
    minimizedIds,
    maximizedId,
  } = useMinimizedPanels(WORKSPACE_PANEL_IDS);

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

  const visibleCount = WORKSPACE_PANEL_IDS.length - minimizedIds.size;
  const cols = maximizedId ? 1 : Math.min(visibleCount, 3);
  const rows = maximizedId ? 1 : Math.max(1, Math.ceil(visibleCount / cols));
  const gridCols = GRID_COL_MAP[cols] ?? 'grid-cols-3';
  const gridRows = rows === 1 ? 'grid-rows-1' : 'grid-rows-2';

  if (isMobile) {
    return (
      <RobotWorkspaceMobile
        robotId={id ?? ''}
        robotName={robot.name}
        robotUrl={robot.url}
        connected={connected}
        status={robot.status}
        lastSeen={robot.lastSeen}
        onConnect={connect}
        onDisconnect={disconnect}
        videoRef={videoRef}
        selectedCameraTopic={selectedTopics.camera ?? ''}
        lidarPoints={lidar.points}
        lidarRangeMax={lidar.rangeMax}
        uptimeSeconds={uptimeSeconds}
        battery={battery}
        rosGraph={rosGraph}
        imuRoll={imu.roll}
        imuPitch={imu.pitch}
        imuYaw={imu.yaw}
        telemetrySeries={telemetrySeries}
        telemetryTimeWindowMs={TELEMETRY_TIME_WINDOW_MS}
        selectedTopics={selectedTopics}
        filteredTopics={filteredTopics}
        onTopicChange={setTopic}
      />
    );
  }

  return (
    <div className="flex flex-col h-full gap-3 p-4">
      <div className={`flex-1 grid gap-3 min-h-0 overflow-hidden ${gridCols} ${gridRows}`}>
          {!isMinimized('camera') && (
              <WorkspacePanel
                label="Camera"
                icon={Camera}
                onMinimize={() => { minimize('camera'); }}
                onMaximize={() => { maximize('camera'); }}
                onRestoreAll={restoreAll}
                maximized={isMaximized('camera')}
              >
                <CameraPanel streamRef={videoRef} connected={connected} label={selectedTopics.camera} />
              </WorkspacePanel>
          )}

          {!isMinimized('lidar') && (
              <WorkspacePanel
                label="LiDAR"
                icon={Radar}
                topicName={selectedTopics.lidar}
                availableTopics={filteredTopics.lidar}
                onTopicChange={(t) => { setTopic('lidar', t); }}
                onMinimize={() => { minimize('lidar'); }}
                onMaximize={() => { maximize('lidar'); }}
                onRestoreAll={restoreAll}
                maximized={isMaximized('lidar')}
              >
                <LidarPanel points={lidar.points} rangeMax={lidar.rangeMax} connected={connected} />
              </WorkspacePanel>
          )}

          {!isMinimized('status') && (
              <WorkspacePanel
                label="System Status"
                icon={Shield}
                onMinimize={() => { minimize('status'); }}
                onMaximize={() => { maximize('status'); }}
                onRestoreAll={restoreAll}
                maximized={isMaximized('status')}
              >
                <SystemStatusPanel
                  name={robot.name}
                  url={robot.url}
                  connected={connected}
                  status={robot.status}
                  lastSeen={robot.lastSeen}
                  uptimeSeconds={uptimeSeconds}
                  battery={battery}
                  rosGraph={rosGraph}
                  onConnect={connect}
                  onDisconnect={disconnect}
                />
              </WorkspacePanel>
          )}

          {!isMinimized('imu') && (
              <WorkspacePanel
                label="IMU Attitude"
                icon={Compass}
                topicName={selectedTopics.imu}
                availableTopics={filteredTopics.imu}
                onTopicChange={(t) => { setTopic('imu', t); }}
                onMinimize={() => { minimize('imu'); }}
                onMaximize={() => { maximize('imu'); }}
                onRestoreAll={restoreAll}
                maximized={isMaximized('imu')}
              >
                <ImuPanel
                  roll={imu.roll}
                  pitch={imu.pitch}
                  yaw={imu.yaw}
                  angularVelocity={imu.angularVelocity}
                  linearAcceleration={imu.linearAcceleration}
                  connected={connected}
                />
              </WorkspacePanel>
          )}

          {!isMinimized('controls') && (
              <WorkspacePanel
                label="Controls"
                icon={Gamepad2}
                topicName={selectedTopics.controls}
                availableTopics={filteredTopics.controls}
                onTopicChange={(t) => { setTopic('controls', t); }}
                onMinimize={() => { minimize('controls'); }}
                onMaximize={() => { maximize('controls'); }}
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
                  robotId={id}
                  onDirectionStart={controls.handleDirectionStart}
                  onDirectionEnd={controls.handleDirectionEnd}
                  onLinearVelocityChange={controls.handleLinearChange}
                  onAngularVelocityChange={controls.handleAngularChange}
                  onEmergencyStop={controls.handleEmergencyStop}
                />
              </WorkspacePanel>
          )}

          {!isMinimized('telemetry') && (
              <WorkspacePanel
                label="Telemetry"
                icon={Activity}
                topicName={selectedTopics.telemetry}
                availableTopics={filteredTopics.telemetry}
                onTopicChange={(t) => { setTopic('telemetry', t); }}
                onMinimize={() => { minimize('telemetry'); }}
                onMaximize={() => { maximize('telemetry'); }}
                onRestoreAll={restoreAll}
                maximized={isMaximized('telemetry')}
              >
                <TelemetryPanel series={telemetrySeries} timeWindowMs={TELEMETRY_TIME_WINDOW_MS} connected={connected} />
              </WorkspacePanel>
          )}
        </div>

        {minimizedIds.size > 0 && (
            <nav aria-label="Minimized panels" className="flex items-center gap-1 shrink-0">
              {WORKSPACE_PANEL_META.filter((p) => isMinimized(p.id)).map((panel) => (
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
        )}
    </div>
  );
}
