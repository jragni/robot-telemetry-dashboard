import type { ImuDigitalViewProps } from './ImuDigitalView.types';
import { ImuSection } from './ImuSection';
import { MetricRow } from './MetricRow';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders all IMU derived fields in a compact digital read-out layout.
 * Numbers are displayed in monospace with color-coded axes:
 *   X → red, Y → green, Z → blue
 */
export function ImuDigitalView({ data }: ImuDigitalViewProps) {
  return (
    <div className="flex flex-col gap-4 p-3 overflow-auto h-full">
      {/* Orientation */}
      <ImuSection title="Orientation">
        <MetricRow
          label="Roll"
          value={fmt(data.roll)}
          unit="deg"
          valueClassName="text-red-400"
        />
        <MetricRow
          label="Pitch"
          value={fmt(data.pitch)}
          unit="deg"
          valueClassName="text-green-400"
        />
        <MetricRow
          label="Yaw"
          value={fmt(data.yaw)}
          unit="deg"
          valueClassName="text-blue-400"
        />
      </ImuSection>

      {/* Linear Acceleration */}
      <ImuSection title="Acceleration">
        <MetricRow
          label="X"
          value={fmt(data.accelX)}
          unit="m/s²"
          valueClassName="text-red-400"
        />
        <MetricRow
          label="Y"
          value={fmt(data.accelY)}
          unit="m/s²"
          valueClassName="text-green-400"
        />
        <MetricRow
          label="Z"
          value={fmt(data.accelZ)}
          unit="m/s²"
          valueClassName="text-blue-400"
        />
        <MetricRow
          label="|a|"
          value={fmt(data.accelMagnitude)}
          unit="m/s²"
          valueClassName="text-foreground"
        />
      </ImuSection>

      {/* Angular Velocity */}
      <ImuSection title="Angular Velocity">
        <MetricRow
          label="X"
          value={fmt(data.angularVelX, 4)}
          unit="rad/s"
          valueClassName="text-red-400"
        />
        <MetricRow
          label="Y"
          value={fmt(data.angularVelY, 4)}
          unit="rad/s"
          valueClassName="text-green-400"
        />
        <MetricRow
          label="Z"
          value={fmt(data.angularVelZ, 4)}
          unit="rad/s"
          valueClassName="text-blue-400"
        />
        <MetricRow
          label="|ω|"
          value={fmt(data.angularVelMagnitude, 4)}
          unit="rad/s"
          valueClassName="text-foreground"
        />
      </ImuSection>
    </div>
  );
}
