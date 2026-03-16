import type { ImuDerivedData } from '../imu.types';

import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ImuDigitalViewProps {
  data: ImuDerivedData;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

interface MetricRowProps {
  label: string;
  value: string;
  unit: string;
  valueClassName?: string;
}

function MetricRow({ label, value, unit, valueClassName }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-xs text-muted-foreground w-24 shrink-0">
        {label}
      </span>
      <span className={cn('font-mono text-xs tabular-nums', valueClassName)}>
        {value}
        <span className="ml-1 text-muted-foreground">{unit}</span>
      </span>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-1 border-b border-border">
        {title}
      </p>
      {children}
    </div>
  );
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
      <Section title="Orientation">
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
      </Section>

      {/* Linear Acceleration */}
      <Section title="Acceleration">
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
      </Section>

      {/* Angular Velocity */}
      <Section title="Angular Velocity">
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
      </Section>
    </div>
  );
}
