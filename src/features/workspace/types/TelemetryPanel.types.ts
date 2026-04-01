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
  readonly series: readonly TelemetrySeries[];
  readonly timeWindowMs: number;
  readonly connected: boolean;
}
