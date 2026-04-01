import { PilotCompass } from './PilotCompass';
import { PilotLidarMinimap } from './PilotLidarMinimap';
import { PilotGyroReadout } from './PilotGyroReadout';
import { PilotStatusBar } from './PilotStatusBar';
import { PilotControls } from './PilotControls';
import { PilotFullscreenToggle } from './PilotFullscreenToggle';
import type { PilotHudProps } from '../types/PilotView.types';

/** PilotHud
 * @description Renders the full HUD overlay layer for Pilot Mode. Positions
 *  all HUD elements using absolute positioning within a pointer-events-none
 *  container. Each child panel re-enables pointer events individually.
 *  Layout: LiDAR top-left, compass top-center, status top-right, gyro
 *  bottom-left, fullscreen toggle bottom-left, controls bottom-right.
 * @param telemetry - Aggregated telemetry state.
 * @param videoStatus - WebRTC video stream status.
 * @param rosbridgeStatus - Rosbridge connection status.
 * @param isFullscreen - Whether Pilot Mode is fullscreen.
 * @param connected - Whether the robot is connected.
 * @param onToggleFullscreen - Callback to toggle fullscreen.
 */
export function PilotHud({
  telemetry,
  videoStatus,
  rosbridgeStatus,
  isFullscreen,
  connected,
  onToggleFullscreen,
  onDirectionStart,
  onDirectionEnd,
  onLinearVelocityChange,
  onAngularVelocityChange,
  onEmergencyStop,
  linearVelocity,
  angularVelocity,
  isActive,
}: PilotHudProps) {
  const heading = telemetry.imu?.yaw ?? 0;

  return (
    <div className="absolute inset-0 pointer-events-none" aria-label="Pilot HUD overlay">
      <div className="absolute top-3 left-3">
        <PilotLidarMinimap
          points={telemetry.lidarPoints}
          rangeMax={telemetry.lidarRangeMax}
          heading={heading}
        />
      </div>

      <div className="absolute top-3 left-1/2 -translate-x-1/2">
        <PilotCompass heading={heading} />
      </div>

      <div className="absolute top-3 right-3 pointer-events-auto">
        <PilotStatusBar
          battery={telemetry.battery}
          rosbridgeStatus={rosbridgeStatus}
          videoStatus={videoStatus}
          uptimeSeconds={telemetry.uptimeSeconds}
        />
      </div>

      <div className="absolute bottom-3 left-3 flex flex-col items-start gap-3">
        <PilotGyroReadout
          pitch={telemetry.imu?.pitch ?? null}
          roll={telemetry.imu?.roll ?? null}
          yaw={telemetry.imu?.yaw ?? null}
          linearSpeed={telemetry.linearSpeed}
        />
        <div className="pointer-events-auto">
          <PilotFullscreenToggle isFullscreen={isFullscreen} onToggle={onToggleFullscreen} />
        </div>
      </div>

      <div className="absolute bottom-3 right-3">
        <PilotControls
          connected={connected}
          activeDirection={null}
          linearVelocity={linearVelocity}
          angularVelocity={angularVelocity}
          isActive={isActive}
          isFullscreen={isFullscreen}
          onDirectionStart={onDirectionStart}
          onDirectionEnd={onDirectionEnd}
          onLinearVelocityChange={onLinearVelocityChange}
          onAngularVelocityChange={onAngularVelocityChange}
          onEmergencyStop={onEmergencyStop}
        />
      </div>
    </div>
  );
}
