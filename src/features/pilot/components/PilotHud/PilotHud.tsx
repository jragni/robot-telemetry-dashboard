import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { PilotCompass } from '../PilotCompass/PilotCompass';
import { PilotLidarMinimap } from '../PilotLidarMinimap';
import { PilotGyroReadout } from '../PilotGyroReadout/PilotGyroReadout';
import { PilotStatusBar } from '../PilotStatusBar/PilotStatusBar';
import { PilotControls } from '../PilotControls/PilotControls';
import { PilotFullscreenToggle } from '../PilotFullscreenToggle';
import type { PilotHudProps } from './PilotHud.types';

/** PilotHud
 * @description Renders the full HUD overlay layer for Pilot Mode. Positions
 *  all HUD elements using absolute positioning within a pointer-events-none
 *  container. Each child panel re-enables pointer events individually.
 *  Layout: LiDAR top-left, compass top-center, status top-right, gyro
 *  bottom-left, fullscreen toggle bottom-left, controls bottom-right.
 * @prop telemetry - Aggregated telemetry state.
 * @prop videoStatus - WebRTC video stream status.
 * @prop rosbridgeStatus - Rosbridge connection status.
 * @prop isFullscreen - Whether Pilot Mode is fullscreen.
 * @prop connected - Whether the robot is connected.
 * @prop onToggleFullscreen - Callback to toggle fullscreen.
 */
export function PilotHud({
  angularVelocity,
  connected,
  isFullscreen,
  linearVelocity,
  onAngularVelocityChange,
  onDirectionEnd,
  onDirectionStart,
  onEmergencyStop,
  onLinearVelocityChange,
  onToggleFullscreen,
  robotId,
  rosbridgeStatus,
  telemetry,
  videoStatus,
}: PilotHudProps) {
  const heading = telemetry.imu?.yaw ?? 0;

  return (
    <div className="absolute inset-0 pointer-events-none" aria-label="Pilot HUD overlay">
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
        <PilotLidarMinimap
          points={telemetry.lidarPoints}
          rangeMax={telemetry.lidarRangeMax}
          heading={heading}
        />
      </div>

      <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2">
        <PilotCompass heading={heading} />
      </div>

      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col items-end gap-2 pointer-events-auto">
        <PilotFullscreenToggle isFullscreen={isFullscreen} onToggle={onToggleFullscreen} />
        <div className="w-36 sm:w-44">
          <PilotStatusBar
            battery={telemetry.battery}
            rosbridgeStatus={rosbridgeStatus}
            videoStatus={videoStatus}
          />
        </div>
      </div>

      <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex flex-col items-start gap-2 sm:gap-3">
        <PilotGyroReadout
          pitch={telemetry.imu?.pitch ?? null}
          roll={telemetry.imu?.roll ?? null}
          yaw={telemetry.imu?.yaw ?? null}
        />
        {robotId ? (
          <div className="pointer-events-auto">
            <Link to={`/robot/${robotId}`}>
              <Button
                variant="ghost"
                size="sm"
                className="bg-surface-base/60 backdrop-blur-sm text-text-primary hover:bg-surface-base/80 font-mono text-xs gap-1.5 cursor-pointer"
                aria-label="Back to dashboard"
              >
                <ArrowLeft size={14} />
                Dashboard
              </Button>
            </Link>
          </div>
        ) : null}
      </div>

      <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-40 sm:w-48">
        <PilotControls
          connected={connected}
          linearVelocity={linearVelocity}
          angularVelocity={angularVelocity}
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
