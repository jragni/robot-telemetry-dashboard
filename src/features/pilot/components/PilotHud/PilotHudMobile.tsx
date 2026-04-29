import { RefreshCw } from 'lucide-react';

import { getBatteryColor, normalizeHeading } from '@/utils';
import { Button } from '@/components/ui/button';

import { HUD_PANEL_BASE } from '../../constants';
import { MINIMAP_SIZE_MOBILE_MAX } from '../PilotLidarMinimap/constants';
import { PilotCompassMobile } from '../PilotCompass/PilotCompassMobile';
import { PilotControls } from '../PilotControls/PilotControls';
import { PilotLidarMinimap } from '../PilotLidarMinimap';
import { GyroInline } from './GyroInline';
import { StatusDot } from './StatusDot';
import type { PilotHudMobileProps } from './PilotHud.types';

/** PilotHudMobile
 * @description Renders the mobile-optimized HUD overlay for Pilot Mode.
 *  Full-width ODST-style compass strip across top, unified status+gyro
 *  row below it, LiDAR minimap bottom-left, controls bottom-right.
 *  No fullscreen toggle or back button — navigation via app shell sidebar.
 */
export function PilotHudMobile({
  angularVelocity,
  connected,
  linearVelocity,
  onAngularVelocityChange,
  onDirectionEnd,
  onDirectionStart,
  onEmergencyStop,
  onLinearVelocityChange,
  onReconnect,
  rosbridgeStatus,
  telemetry,
  videoStatus,
}: PilotHudMobileProps) {
  const heading = telemetry.imu?.yaw ?? 0;
  const headingNormalized = normalizeHeading(heading);
  const videoConnected = videoStatus === 'streaming';
  const rosConnected = rosbridgeStatus === 'connected';
  const batteryPct = telemetry.battery?.percentage ?? null;
  const batteryColor = getBatteryColor(batteryPct);

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none"
      style={{
        touchAction: 'manipulation',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
      aria-label="Pilot HUD overlay — mobile"
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      {/* Full-width compass strip */}
      <div className="absolute top-0 left-0 right-0 pointer-events-auto">
        <div className={`${HUD_PANEL_BASE} rounded-none border-x-0 border-t-0 px-0 py-1`}>
          <PilotCompassMobile heading={headingNormalized} />
        </div>

        {/* Status + gyro row */}
        <div
          className={`${HUD_PANEL_BASE} rounded-none border-x-0 border-t-0 flex items-center gap-3 px-3 py-1`}
        >
          {/* ROS status */}
          <StatusDot connected={rosConnected} label="ROS" />

          {/* Video status */}
          <StatusDot connected={videoConnected} label="VID" />

          {/* Battery */}
          <span className={`font-mono text-xs tabular-nums ${batteryColor}`}>
            {batteryPct !== null ? `${String(Math.round(batteryPct))}%` : '--'}
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Gyro readout inline */}
          <GyroInline
            roll={telemetry.imu?.roll ?? null}
            pitch={telemetry.imu?.pitch ?? null}
            yaw={telemetry.imu?.yaw ?? null}
          />

          {rosbridgeStatus === 'disconnected' && onReconnect ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReconnect}
              className="text-xs font-mono gap-1 text-text-muted hover:text-text-primary cursor-pointer pointer-events-auto"
              aria-label="Reconnect to robot"
            >
              <RefreshCw className="size-3" />
              Retry
            </Button>
          ) : null}
        </div>
      </div>

      {/* LiDAR minimap */}
      <div className="absolute bottom-2 left-2">
        <PilotLidarMinimap
          points={telemetry.lidarPoints}
          rangeMax={telemetry.lidarRangeMax}
          heading={headingNormalized}
          maxSize={MINIMAP_SIZE_MOBILE_MAX}
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-2 right-2 w-36 touch-none">
        <PilotControls
          connected={connected}
          linearVelocity={linearVelocity}
          angularVelocity={angularVelocity}
          isFullscreen={false}
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
