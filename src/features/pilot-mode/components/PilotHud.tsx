import { BatteryIndicator } from './BatteryIndicator';
import { ConnectionBadges } from './ConnectionBadges';
import { HeadingIndicator } from './HeadingIndicator';
import type { PilotHudProps } from './PilotHud.types';
import { VelocityReadout } from './VelocityReadout';

import { Show } from '@/components/shared/Show';

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
      <Show when={heading !== undefined}>
        <div className="absolute left-1/2 top-3 z-20 -translate-x-1/2">
          <HeadingIndicator heading={heading!} />
        </div>
      </Show>

      {/* Top-right area reserved for exit button (rendered by parent) */}

      {/* Bottom-left: Velocity readout */}
      <div className="absolute bottom-3 left-3 z-20">
        <VelocityReadout
          linearVelocity={linearVelocity}
          angularVelocity={angularVelocity}
        />
      </div>

      {/* Battery indicator positioned above velocity readout when available */}
      <Show when={batteryPercentage !== undefined}>
        <div className="absolute bottom-24 left-3 z-20">
          <BatteryIndicator batteryPercentage={batteryPercentage!} />
        </div>
      </Show>
    </>
  );
}
