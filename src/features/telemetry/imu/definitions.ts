// IMU-related type definitions

export interface IMUData {
  orientation: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
  angularVelocity: {
    x: number;
    y: number;
    z: number;
  };
  linearAcceleration: {
    x: number;
    y: number;
    z: number;
  };
}

export interface PlotDataPoint {
  timestamp: number;
  value: number;
}

export interface TopicPlotConfig {
  topic: string;
  field: string;
  color: string;
  data: PlotDataPoint[];
}

export interface DataPoint {
  timestamp: number;
  x: number;
  y: number;
  z: number;
}

export interface IMUPlotProps {
  data: IMUData;
  metric: 'angularVelocity' | 'linearAcceleration';
}

export type ViewMode = 'digital' | 'plot';
export type PlotMetric = 'angularVelocity' | 'linearAcceleration';
