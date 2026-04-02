import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraPanel } from './CameraPanel';
import { LidarPanel } from './LidarPanel';
import { SystemStatusPanel } from './SystemStatusPanel';
import { ImuPanel } from './ImuPanel/ImuPanel';
import { TelemetryPanel } from './TelemetryPanel';
import { TopicSelector } from './TopicSelector';
import { MOBILE_TAB_META, WORKSPACE_PANEL_META } from '../constants';
import type {
  RobotWorkspaceMobileProps,
  ActivePanelContentProps,
  MobileDataPanelId,
  MobileTabId,
} from '../types/RobotWorkspaceMobile.types';

/** RobotWorkspaceMobile
 * @description Renders the mobile workspace layout with a single active panel
 *  and a bottom tab bar for switching. Five data panels (Camera, LiDAR, System
 *  Status, IMU, Telemetry) plus a Pilot nav action tab. Controls panel is
 *  excluded — robot control happens in Pilot Mode.
 */
export function RobotWorkspaceMobile({
  robotId,
  robotName,
  robotUrl,
  connected,
  status,
  lastSeen,
  onConnect,
  onDisconnect,
  videoRef,
  selectedCameraTopic,
  lidarPoints,
  lidarRangeMax,
  uptimeSeconds,
  battery,
  rosGraph,
  imuRoll,
  imuPitch,
  imuYaw,
  telemetrySeries,
  telemetryTimeWindowMs,
  selectedTopics,
  filteredTopics,
  onTopicChange,
}: RobotWorkspaceMobileProps) {
  const [activePanel, setActivePanel] = useState<MobileDataPanelId>('camera');
  const navigate = useNavigate();

  const activeMeta = WORKSPACE_PANEL_META.find((p) => p.id === activePanel);
  const ActiveIcon = activeMeta?.icon;
  const activeLabel = activeMeta?.label ?? '';
  const activeTopicName = selectedTopics[activePanel];
  const activeFilteredTopics = filteredTopics[activePanel];
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
      {/* ── Panel header ─────────────────────────────────────────── */}
      <header className="flex items-center gap-2 px-3 h-10 shrink-0 border-b border-border bg-surface-primary">
        {ActiveIcon ? (
          <ActiveIcon className="size-3.5 text-text-muted shrink-0" aria-hidden="true" />
        ) : null}
        <span className="font-mono text-xs font-semibold text-text-secondary uppercase tracking-widest">
          {activeLabel}
        </span>
        {showTopicSelector && activeTopicName ? (
          <div className="min-w-0 shrink">
            <TopicSelector
              topicName={activeTopicName}
              availableTopics={activeFilteredTopics}
              onTopicChange={(t) => { onTopicChange(activePanel, t); }}
            />
          </div>
        ) : null}
      </header>

      {/* ── Active panel content ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-3 min-h-0 overflow-hidden bg-surface-primary">
        <ActivePanelContent
          activePanel={activePanel}
          connected={connected}
          videoRef={videoRef}
          selectedCameraTopic={selectedCameraTopic}
          lidarPoints={lidarPoints}
          lidarRangeMax={lidarRangeMax}
          robotName={robotName}
          robotUrl={robotUrl}
          status={status}
          lastSeen={lastSeen}
          uptimeSeconds={uptimeSeconds}
          battery={battery}
          rosGraph={rosGraph}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          imuRoll={imuRoll}
          imuPitch={imuPitch}
          imuYaw={imuYaw}
          telemetrySeries={telemetrySeries}
          telemetryTimeWindowMs={telemetryTimeWindowMs}
        />
      </div>

      {/* ── Bottom tab bar ────────────────────────────────────────── */}
      <nav
        className="flex items-center shrink-0 border-t border-border bg-surface-primary"
        aria-label="Workspace panels"
      >
        {MOBILE_TAB_META.map((tab) => {
          const isActive = tab.id === activePanel;
          const isPilot = tab.id === 'pilot';

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => { handleTabPress(tab.id); }}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 cursor-pointer transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none
                ${isActive ? 'text-accent border-t-2 border-accent' : 'text-text-muted border-t-2 border-transparent'}
                ${isPilot && !isActive ? 'text-status-caution' : ''}
              `}
              aria-label={isPilot ? 'Open Pilot Mode' : `Show ${tab.label} panel`}
              aria-current={isActive ? 'page' : undefined}
            >
              <tab.icon className="size-4" aria-hidden="true" />
              <span className="font-mono text-xs">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Sub-component (private to this file)
// ═══════════════════════════════════════════════════════════════════════

/** ActivePanelContent
 * @description Renders the content for the currently active panel tab.
 *  Each panel reuses its existing desktop component unchanged.
 */
function ActivePanelContent({
  activePanel,
  connected,
  videoRef,
  selectedCameraTopic,
  lidarPoints,
  lidarRangeMax,
  robotName,
  robotUrl,
  status,
  lastSeen,
  uptimeSeconds,
  battery,
  rosGraph,
  onConnect,
  onDisconnect,
  imuRoll,
  imuPitch,
  imuYaw,
  telemetrySeries,
  telemetryTimeWindowMs,
}: ActivePanelContentProps) {
  switch (activePanel) {
    case 'camera':
      return <CameraPanel streamRef={videoRef} connected={connected} label={selectedCameraTopic} />;
    case 'lidar':
      return <LidarPanel points={lidarPoints} rangeMax={lidarRangeMax} connected={connected} />;
    case 'status':
      return (
        <SystemStatusPanel
          name={robotName}
          url={robotUrl}
          connected={connected}
          status={status}
          lastSeen={lastSeen}
          uptimeSeconds={uptimeSeconds}
          battery={battery}
          rosGraph={rosGraph}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
        />
      );
    case 'imu':
      return (
        <ImuPanel
          roll={imuRoll}
          pitch={imuPitch}
          yaw={imuYaw}
          connected={connected}
        />
      );
    case 'telemetry':
      return <TelemetryPanel series={telemetrySeries} timeWindowMs={telemetryTimeWindowMs} connected={connected} />;
  }
}
