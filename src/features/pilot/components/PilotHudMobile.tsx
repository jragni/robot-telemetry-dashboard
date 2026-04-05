import { getBatteryColor } from '@/utils/getBatteryColor';
import { normalizeHeading } from '@/utils/normalizeHeading';
import { formatDegrees } from '@/utils/formatDegrees';
import { PilotCompassMobile } from './PilotCompassMobile';
import { PilotLidarMinimap } from './PilotLidarMinimap';
import { PilotControls } from './PilotControls/PilotControls';
import {
  HUD_PANEL_BASE,
  MINIMAP_SIZE_MOBILE_MAX,
} from '../constants';
import type { PilotHudMobileProps, StatusDotProps, GyroInlineProps } from '../types/PilotView.types';

/** PilotHudMobile
 * @description Renders the mobile-optimized HUD overlay for Pilot Mode.
 *  Full-width ODST-style compass strip across top, unified status+gyro
 *  row below it, LiDAR minimap bottom-left, controls bottom-right.
 *  No fullscreen toggle or back button — navigation via app shell sidebar.
 */
export function PilotHudMobile({
  telemetry,
  videoStatus,
  rosbridgeStatus,
  connected,
  onDirectionStart,
  onDirectionEnd,
  onLinearVelocityChange,
  onAngularVelocityChange,
  onEmergencyStop,
  linearVelocity,
  angularVelocity,
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
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
      aria-label="Pilot HUD overlay — mobile"
    >
      {/* ── Full-width compass strip ─────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 pointer-events-auto">
        <div className={`${HUD_PANEL_BASE} rounded-none border-x-0 border-t-0 px-0 py-1`}>
          <PilotCompassMobile heading={headingNormalized} />
        </div>

        {/* ── Status + gyro row ─────────────────────────────────── */}
        <div className={`${HUD_PANEL_BASE} rounded-none border-x-0 border-t-0 flex items-center gap-3 px-3 py-1`}>
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
        </div>
      </div>

      {/* ── LiDAR minimap — bottom-left ──────────────────────────── */}
      <div className="absolute bottom-2 left-2">
        <PilotLidarMinimap
          points={telemetry.lidarPoints}
          rangeMax={telemetry.lidarRangeMax}
          heading={headingNormalized}
          maxSize={MINIMAP_SIZE_MOBILE_MAX}
        />
      </div>

      {/* ── Controls — bottom-right (same column layout as desktop) ── */}
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

// ═══════════════════════════════════════════════════════════════════════
// Sub-components (private to this file)
// ═══════════════════════════════════════════════════════════════════════

/** StatusDot
 * @description Renders a colored dot + label for connection status.
 */
function StatusDot({ connected, label }: StatusDotProps) {
  return (
    <div className="flex items-center gap-1">
      <span
        className={`size-1.5 rounded-full ${
          connected
            ? 'bg-status-nominal motion-safe:animate-pulse'
            : 'bg-status-critical'
        }`}
        aria-hidden="true"
      />
      <span className={`font-mono text-xs ${connected ? 'text-status-nominal' : 'text-status-critical'}`}>
        {label}
      </span>
    </div>
  );
}

/** GyroInline
 * @description Renders R P Y values in a compact inline row.
 */
function GyroInline({ roll, pitch, yaw }: GyroInlineProps) {
  const fmt = (v: number | null) => (v !== null ? formatDegrees(v) : '---');

  return (
    <div className="flex items-center gap-2" aria-label="Gyro readout">
      <span className="font-mono text-xs text-text-muted">
        R:<span className="text-text-primary tabular-nums">{fmt(roll)}</span>
      </span>
      <span className="font-mono text-xs text-text-muted">
        P:<span className="text-text-primary tabular-nums">{fmt(pitch)}</span>
      </span>
      <span className="font-mono text-xs text-text-muted">
        Y:<span className="text-text-primary tabular-nums">{fmt(yaw)}</span>
      </span>
    </div>
  );
}
