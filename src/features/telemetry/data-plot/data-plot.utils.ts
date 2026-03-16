import type {
  NumericPath,
  PlotSample,
  PlotStrategy,
  PlotStrategyId,
} from './data-plot.types';

// ---------------------------------------------------------------------------
// Strategy catalogue
// ---------------------------------------------------------------------------

const STRATEGIES: Record<PlotStrategyId, PlotStrategy> = {
  'imu-acceleration': {
    id: 'imu-acceleration',
    label: 'IMU Linear Acceleration',
    paths: [
      { label: 'ax', path: ['linear_acceleration', 'x'], unit: 'm/s²' },
      { label: 'ay', path: ['linear_acceleration', 'y'], unit: 'm/s²' },
      { label: 'az', path: ['linear_acceleration', 'z'], unit: 'm/s²' },
    ],
  },
  'imu-angular-velocity': {
    id: 'imu-angular-velocity',
    label: 'IMU Angular Velocity',
    paths: [
      { label: 'wx', path: ['angular_velocity', 'x'], unit: 'rad/s' },
      { label: 'wy', path: ['angular_velocity', 'y'], unit: 'rad/s' },
      { label: 'wz', path: ['angular_velocity', 'z'], unit: 'rad/s' },
    ],
  },
  'odometry-linear': {
    id: 'odometry-linear',
    label: 'Odometry Linear Velocity',
    paths: [
      { label: 'vx', path: ['twist', 'twist', 'linear', 'x'], unit: 'm/s' },
      { label: 'vy', path: ['twist', 'twist', 'linear', 'y'], unit: 'm/s' },
      { label: 'vz', path: ['twist', 'twist', 'linear', 'z'], unit: 'm/s' },
    ],
  },
  'battery-voltage': {
    id: 'battery-voltage',
    label: 'Battery Voltage',
    paths: [{ label: 'Battery Voltage', path: ['voltage'], unit: 'V' }],
  },
  'numeric-flat': {
    id: 'numeric-flat',
    label: 'Numeric (auto-detected)',
    paths: [],
  },
};

// ---------------------------------------------------------------------------
// Message type → strategy mapping
// ---------------------------------------------------------------------------

const MESSAGE_TYPE_MAP: Record<string, PlotStrategyId> = {
  'sensor_msgs/Imu': 'imu-acceleration',
  'sensor_msgs/BatteryState': 'battery-voltage',
  'nav_msgs/Odometry': 'odometry-linear',
};

// ---------------------------------------------------------------------------
// detectPlotStrategy
// ---------------------------------------------------------------------------

/**
 * Returns a PlotStrategy for the given ROS message type string.
 * Falls back to the generic 'numeric-flat' strategy for unrecognised types.
 */
export function detectPlotStrategy(messageType: string): PlotStrategy {
  const id = MESSAGE_TYPE_MAP[messageType] ?? 'numeric-flat';
  return STRATEGIES[id];
}

// ---------------------------------------------------------------------------
// extractNumericPaths
// ---------------------------------------------------------------------------

/**
 * Recursively walks a plain object and returns a NumericPath for every leaf
 * that is a finite number.  Arrays are skipped to avoid path explosion.
 */
export function extractNumericPaths(
  obj: unknown,
  prefix: string[] = []
): NumericPath[] {
  if (obj === null || obj === undefined) return [];
  if (typeof obj !== 'object') return [];
  if (Array.isArray(obj)) return [];

  const record = obj as Record<string, unknown>;
  const results: NumericPath[] = [];

  for (const key of Object.keys(record)) {
    const value = record[key];
    const path = [...prefix, key];

    if (typeof value === 'number' && isFinite(value)) {
      results.push({ label: key, path });
    } else if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      results.push(...extractNumericPaths(value, path));
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// extractSample
// ---------------------------------------------------------------------------

/**
 * Extracts a PlotSample from a message by reading the value at each
 * NumericPath.  Missing or non-numeric values default to 0.
 */
export function extractSample(
  msg: unknown,
  paths: NumericPath[],
  timestamp: number
): PlotSample {
  const values: Record<string, number> = {};

  for (const { label, path } of paths) {
    let cursor: unknown = msg;
    for (const segment of path) {
      if (
        cursor !== null &&
        typeof cursor === 'object' &&
        !Array.isArray(cursor)
      ) {
        cursor = (cursor as Record<string, unknown>)[segment];
      } else {
        cursor = undefined;
        break;
      }
    }
    values[label] = typeof cursor === 'number' && isFinite(cursor) ? cursor : 0;
  }

  return { timestamp, values };
}
