import { describe, expect, it } from 'vitest';
import {
  odometryMessageSchema,
  twistMessageSchema,
  telemetryImuMessageSchema,
  telemetryBatteryMessageSchema,
  telemetryLaserScanMessageSchema,
} from '../useTelemetrySubscription';

describe('odometryMessageSchema', () => {
  it('parses a valid Odometry message', () => {
    const msg = {
      twist: { twist: { linear: { x: 1, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0.5 } } },
    };
    const result = odometryMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
  });

  it('rejects an empty object', () => {
    expect(odometryMessageSchema.safeParse({}).success).toBe(false);
  });

  it('rejects missing nested twist', () => {
    const msg = { twist: {} };
    expect(odometryMessageSchema.safeParse(msg).success).toBe(false);
  });
});

describe('twistMessageSchema', () => {
  it('parses a valid Twist message', () => {
    const msg = { linear: { x: 1, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0.5 } };
    const result = twistMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
  });

  it('rejects an empty object', () => {
    expect(twistMessageSchema.safeParse({}).success).toBe(false);
  });

  it('rejects partial data', () => {
    const msg = { linear: { x: 1, y: 0, z: 0 } };
    expect(twistMessageSchema.safeParse(msg).success).toBe(false);
  });
});

describe('telemetryImuMessageSchema', () => {
  it('parses a valid IMU message', () => {
    const msg = {
      angular_velocity: { x: 0.1, y: 0.2, z: 0.3 },
      linear_acceleration: { x: 0, y: 0, z: 9.81 },
    };
    const result = telemetryImuMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
  });

  it('rejects an empty object', () => {
    expect(telemetryImuMessageSchema.safeParse({}).success).toBe(false);
  });

  it('rejects missing linear_acceleration', () => {
    const msg = { angular_velocity: { x: 0, y: 0, z: 0 } };
    expect(telemetryImuMessageSchema.safeParse(msg).success).toBe(false);
  });
});

describe('telemetryBatteryMessageSchema', () => {
  it('parses a valid BatteryState message', () => {
    const msg = { voltage: 12.6, percentage: 0.85 };
    const result = telemetryBatteryMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
  });

  it('rejects an empty object', () => {
    expect(telemetryBatteryMessageSchema.safeParse({}).success).toBe(false);
  });

  it('rejects non-numeric voltage', () => {
    const msg = { voltage: 'high', percentage: 0.85 };
    expect(telemetryBatteryMessageSchema.safeParse(msg).success).toBe(false);
  });
});

describe('telemetryLaserScanMessageSchema', () => {
  it('parses a valid LaserScan message', () => {
    const msg = { range_min: 0.1, range_max: 30, ranges: [1.0, 2.0, 3.0] };
    const result = telemetryLaserScanMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
  });

  it('rejects an empty object', () => {
    expect(telemetryLaserScanMessageSchema.safeParse({}).success).toBe(false);
  });

  it('rejects missing ranges (normalization happens upstream)', () => {
    const msg = { range_min: 0.1, range_max: 30 };
    const result = telemetryLaserScanMessageSchema.safeParse(msg);
    expect(result.success).toBe(false);
  });
});
