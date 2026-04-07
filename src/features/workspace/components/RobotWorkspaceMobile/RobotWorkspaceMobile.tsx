import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { WORKSPACE_PANEL_META } from '@/features/workspace/constants';
import type {
  MobileDataPanelId,
  MobileTabId,
} from '@/features/workspace/types/RobotWorkspaceMobile.types';

import { ActivePanelContent } from '../ActivePanelContent';
import { MobilePanelHeader } from './MobilePanelHeader';
import { MobileTabBar } from './MobileTabBar';
import type { RobotWorkspaceMobileProps } from './RobotWorkspaceMobile.types';

/** RobotWorkspaceMobile
 * @description Renders the mobile workspace layout with a single active panel
 *  and a bottom tab bar for switching. Five data panels (Camera, LiDAR, System
 *  Status, IMU, Telemetry) plus a Pilot nav action tab. Each panel self-subscribes
 *  to ROS data — only the active panel maintains a subscription.
 * @prop ros - Active roslib connection, or undefined when disconnected.
 * @prop connected - Whether the robot is currently connected.
 * @prop robot - Full robot connection record.
 * @prop selectedTopics - Per-panel selected ROS topic names.
 * @prop filteredTopics - Per-panel filtered available topics.
 * @prop onTopicChange - Callback when a panel's topic selection changes.
 * @prop onConnect - Callback to initiate connection.
 * @prop onDisconnect - Callback to disconnect.
 */
export function RobotWorkspaceMobile({
  connected,
  filteredTopics,
  onConnect,
  onDisconnect,
  onTopicChange,
  robot,
  ros,
  selectedTopics,
}: RobotWorkspaceMobileProps) {
  const [activePanel, setActivePanel] = useState<MobileDataPanelId>('camera');
  const navigate = useNavigate();

  const activeMeta = WORKSPACE_PANEL_META.find((p) => p.id === activePanel);
  const activeTopicName = selectedTopics[activePanel];
  const activeFilteredTopics = filteredTopics[activePanel];
  const showTopicSelector = activePanel !== 'camera' && activePanel !== 'status';

  function handleTabPress(tabId: MobileTabId) {
    if (tabId === 'pilot') {
      if (robot.id) void navigate(`/pilot/${robot.id}`);
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
          connected={connected}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          robot={robot}
          ros={ros}
          selectedTopics={selectedTopics}
        />
      </div>

      <MobileTabBar activePanel={activePanel} onTabPress={handleTabPress} />
    </div>
  );
}
