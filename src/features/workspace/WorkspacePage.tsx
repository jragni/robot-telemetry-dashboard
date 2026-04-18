import { useParams } from 'react-router-dom';
import { Activity, Camera, Compass, Gamepad2, Radar, Shield } from 'lucide-react';

import { useIsMobile, useRobotConnection } from '@/hooks';

import { useMinimizedPanels, useTopicManager } from './hooks';
import {
  CameraPanel,
  ControlsPanel,
  ImuPanel,
  LidarPanel,
  MinimizedPanelBar,
  RobotWorkspaceMobile,
  SystemStatusPanel,
  TelemetryPanel,
  WorkspaceNotFound,
  WorkspacePanel,
} from './components';
import { GRID_COL_MAP, WORKSPACE_PANEL_IDS } from './constants';

/** WorkspacePage
 * @description Thin orchestrator for the workspace page. Gets robot connection,
 *  topic management, and panel layout state, then delegates rendering to
 *  WorkspacePanel wrappers. Each panel owns its own ROS subscriptions.
 */
export function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const { robot, connected, ros, connect, disconnect } = useRobotConnection(id);
  const { filteredTopics, selectedTopics, setTopic } = useTopicManager(id, ros);
  const isMobile = useIsMobile();
  const {
    isMaximized,
    isMinimized,
    maximize,
    maximizedId,
    minimize,
    minimizedIds,
    restore,
    restoreAll,
  } = useMinimizedPanels(WORKSPACE_PANEL_IDS);

  if (!robot) return <WorkspaceNotFound robotId={id} />;

  if (isMobile) {
    return (
      <RobotWorkspaceMobile
        connected={connected}
        filteredTopics={filteredTopics}
        onConnect={connect}
        onDisconnect={disconnect}
        onTopicChange={setTopic}
        robot={robot}
        ros={ros}
        selectedTopics={selectedTopics}
      />
    );
  }

  const visibleCount = WORKSPACE_PANEL_IDS.length - minimizedIds.size;
  const cols = maximizedId ? 1 : Math.min(visibleCount, 3);
  const rows = maximizedId ? 1 : Math.max(1, Math.ceil(visibleCount / cols));
  const gridCols = GRID_COL_MAP[cols] ?? 'grid-cols-3';
  const gridRows = rows === 1 ? 'grid-rows-1' : 'grid-rows-2';

  return (
    <div className="flex flex-col h-full gap-3 p-4">
      <div className={`flex-1 grid gap-3 min-h-0 overflow-hidden ${gridCols} ${gridRows}`}>
        {!isMinimized('camera') && (
          <WorkspacePanel
            label="Camera"
            icon={Camera}
            Component={CameraPanel}
            componentProps={{ connected, robotUrl: robot.url }}
            onMinimize={() => {
              minimize('camera');
            }}
            onMaximize={() => {
              maximize('camera');
            }}
            onRestoreAll={restoreAll}
            maximized={isMaximized('camera')}
          />
        )}

        {!isMinimized('lidar') && (
          <WorkspacePanel
            label="LiDAR"
            icon={Radar}
            Component={LidarPanel}
            componentProps={{ connected, ros, topicName: selectedTopics.lidar ?? '' }}
            topicName={selectedTopics.lidar}
            availableTopics={filteredTopics.lidar}
            onTopicChange={(t) => {
              setTopic('lidar', t);
            }}
            onMinimize={() => {
              minimize('lidar');
            }}
            onMaximize={() => {
              maximize('lidar');
            }}
            onRestoreAll={restoreAll}
            maximized={isMaximized('lidar')}
          />
        )}

        {!isMinimized('status') && (
          <WorkspacePanel
            label="System Status"
            icon={Shield}
            Component={SystemStatusPanel}
            componentProps={{ connected, onConnect: connect, onDisconnect: disconnect, robot, ros }}
            onMinimize={() => {
              minimize('status');
            }}
            onMaximize={() => {
              maximize('status');
            }}
            onRestoreAll={restoreAll}
            maximized={isMaximized('status')}
          />
        )}

        {!isMinimized('imu') && (
          <WorkspacePanel
            label="IMU Attitude"
            icon={Compass}
            Component={ImuPanel}
            componentProps={{ connected, ros, topicName: selectedTopics.imu ?? '' }}
            topicName={selectedTopics.imu}
            availableTopics={filteredTopics.imu}
            onTopicChange={(t) => {
              setTopic('imu', t);
            }}
            onMinimize={() => {
              minimize('imu');
            }}
            onMaximize={() => {
              maximize('imu');
            }}
            onRestoreAll={restoreAll}
            maximized={isMaximized('imu')}
          />
        )}

        {!isMinimized('controls') && (
          <WorkspacePanel
            label="Controls"
            icon={Gamepad2}
            Component={ControlsPanel}
            componentProps={{
              connected,
              robotId: id,
              ros,
              topicName: selectedTopics.controls ?? '',
            }}
            topicName={selectedTopics.controls}
            availableTopics={filteredTopics.controls}
            onTopicChange={(t) => {
              setTopic('controls', t);
            }}
            onMinimize={() => {
              minimize('controls');
            }}
            onMaximize={() => {
              maximize('controls');
            }}
            onRestoreAll={restoreAll}
            maximized={isMaximized('controls')}
          />
        )}

        {!isMinimized('telemetry') && (
          <WorkspacePanel
            label="Telemetry"
            icon={Activity}
            Component={TelemetryPanel}
            componentProps={{ connected, ros, topicName: selectedTopics.telemetry ?? '' }}
            topicName={selectedTopics.telemetry}
            availableTopics={filteredTopics.telemetry}
            onTopicChange={(t) => {
              setTopic('telemetry', t);
            }}
            onMinimize={() => {
              minimize('telemetry');
            }}
            onMaximize={() => {
              maximize('telemetry');
            }}
            onRestoreAll={restoreAll}
            maximized={isMaximized('telemetry')}
          />
        )}
      </div>

      <MinimizedPanelBar
        minimizedIds={minimizedIds}
        isMinimized={isMinimized}
        onRestore={restore}
      />
    </div>
  );
}
