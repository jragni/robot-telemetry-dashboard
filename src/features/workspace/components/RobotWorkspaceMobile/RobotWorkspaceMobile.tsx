import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { WORKSPACE_PANEL_META } from '../../constants';

import type { MobileDataPanelId, MobileTabId } from '../../types/RobotWorkspaceMobile.types';

import { ActivePanelContent } from '../ActivePanelContent';
import { MobilePanelHeader } from './MobilePanelHeader';
import { MobileTabBar } from './MobileTabBar';
import type { RobotWorkspaceMobileProps } from './RobotWorkspaceMobile.types';

/** RobotWorkspaceMobile
 * @description Renders the mobile workspace layout with a single active panel
 *  and a bottom tab bar for switching. Five data panels (Camera, LiDAR, System
 *  Status, IMU, Telemetry) plus a Pilot nav action tab. Controls panel is
 *  excluded — robot control happens in Pilot Mode.
 */
export function RobotWorkspaceMobile({
  battery,
  connected,
  filteredTopics,
  imuPitch,
  imuRoll,
  imuYaw,
  lastSeen,
  lidarPoints,
  lidarRangeMax,
  onConnect,
  onDisconnect,
  onTopicChange,
  robotId,
  robotName,
  robotUrl,
  rosGraph,
  selectedCameraTopic,
  selectedTopics,
  status,
  telemetrySeries,
  telemetryTimeWindowMs,
  uptimeSeconds,
  videoRef,
}: RobotWorkspaceMobileProps) {
  const [activePanel, setActivePanel] = useState<MobileDataPanelId>('camera');
  const navigate = useNavigate();

  const activeMeta = WORKSPACE_PANEL_META.find((p) => p.id === activePanel);
  const activeTopicName = selectedTopics[activePanel];
  const activeFilteredTopics = filteredTopics[activePanel] ?? [];
  const showTopicSelector = activePanel !== 'camera' && activePanel !== 'status';

  function handleTabPress(tabId: MobileTabId) {
    if (tabId === 'pilot') {
      if (robotId) void navigate(`/pilot/${robotId}`);
      return;
    }
    setActivePanel(tabId);
  }

  return (
    <div
      className="flex flex-col h-full select-none"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <MobilePanelHeader
        activeFilteredTopics={activeFilteredTopics}
        activeLabel={activeMeta?.label ?? ''}
        activePanel={activePanel}
        activeTopicName={activeTopicName}
        icon={activeMeta?.icon}
        onTopicChange={onTopicChange}
        showTopicSelector={showTopicSelector}
      />

      <div className="flex-1 flex items-center justify-center p-3 min-h-0 overflow-hidden bg-surface-primary">
        <ActivePanelContent
          activePanel={activePanel}
          cameraProps={{ connected, label: selectedCameraTopic, streamRef: videoRef }}
          imuProps={{ connected, pitch: imuPitch, roll: imuRoll, yaw: imuYaw }}
          lidarProps={{ connected, points: lidarPoints, rangeMax: lidarRangeMax }}
          statusProps={{
            battery,
            connected,
            lastSeen,
            name: robotName,
            onConnect,
            onDisconnect,
            rosGraph,
            status,
            uptimeSeconds,
            url: robotUrl,
          }}
          telemetryProps={{ connected, series: telemetrySeries, timeWindowMs: telemetryTimeWindowMs }}
        />
      </div>

      <MobileTabBar activePanel={activePanel} onTabPress={handleTabPress} />
    </div>
  );
}
