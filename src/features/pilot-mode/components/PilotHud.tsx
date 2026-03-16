import type { PilotHudData } from '../pilot-mode.types';

import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format degrees to a 3-digit zero-padded string with a degree symbol. */
function formatHeading(deg: number): string {
  const normalised = ((deg % 360) + 360) % 360;
  return `${Math.round(normalised).toString().padStart(3, '0')}°`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Semi-transparent HUD panel wrapper for consistent styling. */
function HudPanel({
  children,
  className,
  'data-testid': testId,
}: {
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}) {
  return (
    <div
      data-testid={testId}
      className={cn(
        'rounded border border-border/40 bg-black/60 px-3 py-2 backdrop-blur-sm',
        className
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Connection Badges
// ---------------------------------------------------------------------------

interface ConnectionBadgesProps {
  rosConnectionState: PilotHudData['rosConnectionState'];
  webrtcConnectionState: PilotHudData['webrtcConnectionState'];
}

export function ConnectionBadges({
  rosConnectionState,
  webrtcConnectionState,
}: ConnectionBadgesProps) {
  return (
    <HudPanel
      data-testid="hud-connection-badges"
      className="flex flex-col gap-1.5"
    >
      <StatusIndicator state={rosConnectionState} label="ROS" />
      <StatusIndicator state={webrtcConnectionState} label="VIDEO" />
    </HudPanel>
  );
}

// ---------------------------------------------------------------------------
// Velocity Readout
// ---------------------------------------------------------------------------

interface VelocityReadoutProps {
  linearVelocity: number;
  angularVelocity: number;
}

export function VelocityReadout({
  linearVelocity,
  angularVelocity,
}: VelocityReadoutProps) {
  return (
    <HudPanel
      data-testid="hud-velocity-readout"
      className="flex flex-col gap-1"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          LIN
        </span>
        <span className="font-mono text-sm tabular-nums text-foreground">
          {linearVelocity.toFixed(1)}
          <span className="text-[10px] text-muted-foreground"> m/s</span>
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          ANG
        </span>
        <span className="font-mono text-sm tabular-nums text-foreground">
          {angularVelocity.toFixed(1)}
          <span className="text-[10px] text-muted-foreground"> r/s</span>
        </span>
      </div>
    </HudPanel>
  );
}

// ---------------------------------------------------------------------------
// Heading Indicator
// ---------------------------------------------------------------------------

interface HeadingIndicatorProps {
  heading: number;
}

export function HeadingIndicator({ heading }: HeadingIndicatorProps) {
  return (
    <HudPanel
      data-testid="hud-heading-indicator"
      className="flex items-center gap-2"
    >
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        HDG
      </span>
      <span className="font-mono text-lg tabular-nums text-foreground">
        {formatHeading(heading)}
      </span>
    </HudPanel>
  );
}

// ---------------------------------------------------------------------------
// Battery Indicator
// ---------------------------------------------------------------------------

interface BatteryIndicatorProps {
  batteryPercentage: number;
}

export function BatteryIndicator({ batteryPercentage }: BatteryIndicatorProps) {
  const isLow = batteryPercentage < 20;
  const isCritical = batteryPercentage < 10;

  return (
    <HudPanel
      data-testid="hud-battery-indicator"
      className="flex items-center gap-2"
    >
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        BAT
      </span>
      <span
        className={cn(
          'font-mono text-sm tabular-nums',
          isCritical
            ? 'text-status-critical'
            : isLow
              ? 'text-status-degraded'
              : 'text-status-nominal'
        )}
      >
        {batteryPercentage}%
      </span>
    </HudPanel>
  );
}

// ---------------------------------------------------------------------------
// PilotHud — Composed overlay
// ---------------------------------------------------------------------------

interface PilotHudProps {
  hudData: PilotHudData;
  onExit: () => void;
}

/**
 * Full HUD overlay layer. Renders all data badges as absolutely-positioned
 * elements within the pilot layout's viewport container.
 *
 * The parent container must be `position: relative` or `position: absolute`
 * with `inset-0` so the HUD items position correctly.
 */
export function PilotHud({ hudData }: PilotHudProps) {
  const {
    rosConnectionState,
    webrtcConnectionState,
    linearVelocity,
    angularVelocity,
    heading,
    batteryPercentage,
  } = hudData;

  return (
    <>
      {/* Top-left: Connection status badges */}
      <div className="absolute left-3 top-3 z-20">
        <ConnectionBadges
          rosConnectionState={rosConnectionState}
          webrtcConnectionState={webrtcConnectionState}
        />
      </div>

      {/* Top-center: Heading indicator (only if IMU data available) */}
      {heading !== undefined && (
        <div className="absolute left-1/2 top-3 z-20 -translate-x-1/2">
          <HeadingIndicator heading={heading} />
        </div>
      )}

      {/* Top-right area reserved for exit button (rendered by parent) */}

      {/* Bottom-left: Velocity readout */}
      <div className="absolute bottom-3 left-3 z-20">
        <VelocityReadout
          linearVelocity={linearVelocity}
          angularVelocity={angularVelocity}
        />
      </div>

      {/* Battery indicator positioned above velocity readout when available */}
      {batteryPercentage !== undefined && (
        <div className="absolute bottom-24 left-3 z-20">
          <BatteryIndicator batteryPercentage={batteryPercentage} />
        </div>
      )}
    </>
  );
}
