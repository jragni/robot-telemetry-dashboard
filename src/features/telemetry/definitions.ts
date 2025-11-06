// Telemetry types, interfaces, and enums

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

export interface LidarPoint {
  angle: number;
  distance: number;
  intensity?: number;
}

export interface LidarData {
  ranges: number[];
  angleMin: number;
  angleMax: number;
  angleIncrement: number;
  rangeMin: number;
  rangeMax: number;
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

export interface TelemetryData {
  imu: IMUData;
  lidar: LidarData;
  timestamp: number;
}
