import type { Ros } from 'roslib';

export interface PlotDataPoint {
  readonly timestamp: number;
  readonly value: number;
}

export interface TelemetrySeries {
  readonly label: string;
  readonly color: string;
  readonly data: readonly PlotDataPoint[];
}

export interface TelemetryPanelProps {
  readonly connected: boolean;
  readonly ros: Ros | undefined;
  readonly topicName: string;
}
