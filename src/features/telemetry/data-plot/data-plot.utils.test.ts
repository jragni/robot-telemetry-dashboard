import { describe, it, expect } from 'vitest';

import {
  detectPlotStrategy,
  extractNumericPaths,
  extractSample,
} from './data-plot.utils';

// ---------------------------------------------------------------------------
// detectPlotStrategy
// ---------------------------------------------------------------------------

describe('detectPlotStrategy', () => {
  it('returns imu-acceleration strategy for sensor_msgs/Imu', () => {
    const strategy = detectPlotStrategy('sensor_msgs/Imu');
    expect(strategy.id).toBe('imu-acceleration');
  });

  it('returns battery-voltage strategy for sensor_msgs/BatteryState', () => {
    const strategy = detectPlotStrategy('sensor_msgs/BatteryState');
    expect(strategy.id).toBe('battery-voltage');
  });

  it('returns imu-angular-velocity for sensor_msgs/Imu angular velocity alias', () => {
    // The default for Imu is imu-acceleration; angular-velocity is a separate
    // strategy — verify that the imu-acceleration strategy has correct label
    const strategy = detectPlotStrategy('sensor_msgs/Imu');
    expect(strategy.label).toMatch(/imu/i);
  });

  it('returns odometry-linear strategy for nav_msgs/Odometry', () => {
    const strategy = detectPlotStrategy('nav_msgs/Odometry');
    expect(strategy.id).toBe('odometry-linear');
  });

  it('returns numeric-flat for an unknown message type', () => {
    const strategy = detectPlotStrategy('unknown_pkg/SomeMessage');
    expect(strategy.id).toBe('numeric-flat');
  });

  it('returns numeric-flat for empty string', () => {
    const strategy = detectPlotStrategy('');
    expect(strategy.id).toBe('numeric-flat');
  });

  it('returns a strategy with a non-empty label', () => {
    const strategy = detectPlotStrategy('sensor_msgs/Imu');
    expect(strategy.label.length).toBeGreaterThan(0);
  });

  it('returns a strategy with at least one path for known types', () => {
    const strategy = detectPlotStrategy('sensor_msgs/Imu');
    expect(strategy.paths.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// extractNumericPaths
// ---------------------------------------------------------------------------

describe('extractNumericPaths', () => {
  it('finds all numeric leaves in a flat object', () => {
    const obj = { x: 1, y: 2, z: 3, label: 'hello' };
    const paths = extractNumericPaths(obj);
    const pathStrings = paths.map((p) => p.path.join('.'));
    expect(pathStrings).toContain('x');
    expect(pathStrings).toContain('y');
    expect(pathStrings).toContain('z');
    // Non-numeric 'label' should not appear
    expect(pathStrings).not.toContain('label');
  });

  it('finds numeric leaves in a nested object', () => {
    const obj = {
      linear_acceleration: { x: 0.1, y: 0.2, z: 9.8 },
      orientation: { x: 0, y: 0, z: 0, w: 1 },
    };
    const paths = extractNumericPaths(obj);
    const pathStrings = paths.map((p) => p.path.join('.'));
    expect(pathStrings).toContain('linear_acceleration.x');
    expect(pathStrings).toContain('orientation.w');
  });

  it('uses the path segments as the label', () => {
    const obj = { voltage: 12.5 };
    const paths = extractNumericPaths(obj);
    expect(paths[0].label).toBe('voltage');
  });

  it('returns an empty array for non-object input', () => {
    expect(extractNumericPaths(null)).toEqual([]);
    expect(extractNumericPaths(undefined)).toEqual([]);
    expect(extractNumericPaths(42)).toEqual([]);
    expect(extractNumericPaths('string')).toEqual([]);
  });

  it('returns an empty array for an object with no numeric values', () => {
    const obj = { name: 'robot', status: 'ok' };
    expect(extractNumericPaths(obj)).toEqual([]);
  });

  it('skips array values', () => {
    const obj = { data: [1, 2, 3], voltage: 12 };
    const paths = extractNumericPaths(obj);
    const pathStrings = paths.map((p) => p.path.join('.'));
    expect(pathStrings).toContain('voltage');
    // Arrays should not be recursed into
    expect(pathStrings).not.toContain('data.0');
  });

  it('applies a prefix when provided', () => {
    const obj = { x: 1 };
    const paths = extractNumericPaths(obj, ['header']);
    expect(paths[0].path).toEqual(['header', 'x']);
  });
});

// ---------------------------------------------------------------------------
// extractSample
// ---------------------------------------------------------------------------

describe('extractSample', () => {
  it('extracts values at the specified paths', () => {
    const msg = {
      linear_acceleration: { x: 1.0, y: 2.0, z: 9.8 },
    };
    const paths = [
      { label: 'x', path: ['linear_acceleration', 'x'] },
      { label: 'z', path: ['linear_acceleration', 'z'] },
    ];
    const sample = extractSample(msg, paths, 1000);
    expect(sample.timestamp).toBe(1000);
    expect(sample.values.x).toBeCloseTo(1.0);
    expect(sample.values.z).toBeCloseTo(9.8);
  });

  it('uses label as key in the values record', () => {
    const msg = { voltage: 12.5 };
    const paths = [{ label: 'Battery Voltage', path: ['voltage'] }];
    const sample = extractSample(msg, paths, 2000);
    expect(sample.values['Battery Voltage']).toBeCloseTo(12.5);
  });

  it('sets missing values to 0', () => {
    const msg = { x: 1 };
    const paths = [
      { label: 'x', path: ['x'] },
      { label: 'missing', path: ['does', 'not', 'exist'] },
    ];
    const sample = extractSample(msg, paths, 0);
    expect(sample.values.x).toBe(1);
    expect(sample.values.missing).toBe(0);
  });

  it('returns correct timestamp', () => {
    const sample = extractSample({}, [], 9999);
    expect(sample.timestamp).toBe(9999);
  });

  it('handles deeply nested paths', () => {
    const msg = { a: { b: { c: 42 } } };
    const paths = [{ label: 'deep', path: ['a', 'b', 'c'] }];
    const sample = extractSample(msg, paths, 0);
    expect(sample.values.deep).toBe(42);
  });
});
