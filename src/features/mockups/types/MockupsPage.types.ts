import type { LucideIcon } from 'lucide-react';

export interface MockSection {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
}

export interface ColorTokenGroup {
  readonly namespace: string;
  readonly tokens: readonly string[];
}

export interface TypographySample {
  readonly sizePx: number;
  readonly tailwindClass: string;
  readonly label: string;
}

export interface StatusState {
  readonly label: string;
  readonly Icon: LucideIcon;
  readonly colorClass: string;
  readonly bgClass: string;
  readonly dotClass: string;
}

export interface ButtonVariantDemo {
  readonly label: string;
  readonly variant: 'default' | 'secondary' | 'destructive' | 'ghost' | 'outline';
}

export interface SpacingStep {
  readonly px: number;
  readonly tailwindClass: string;
}

export interface TelemetryDataPoint {
  readonly timestamp: number;
  readonly value: number;
}

export interface MockTelemetryData {
  readonly batteryLevel: number;
  readonly uptimeSeconds: number;
  readonly imu: {
    readonly roll: number;
    readonly pitch: number;
    readonly yaw: number;
  };
  readonly linearVelocity: number;
  readonly angularVelocity: number;
  readonly lidarPoints: readonly { angle: number; distance: number }[];
  readonly telemetrySeries: readonly {
    label: string;
    color: string;
    data: TelemetryDataPoint[];
  }[];
}

export interface MockupSectionProps {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly children: React.ReactNode;
}

export interface IconEntry {
  readonly name: string;
  readonly Icon: LucideIcon;
}

export interface BorderEffect {
  readonly label: string;
  readonly className: string;
}

export interface AnimationEntry {
  readonly label: string;
  readonly className: string;
}
