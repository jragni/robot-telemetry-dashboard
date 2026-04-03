import { describe, expect, it } from 'vitest';
import { imuMessageSchema } from '../useImuSubscription';

describe('imuMessageSchema', () => {
  it('parses a valid full IMU message', () => {
    const msg = {
      orientation: { x: 0, y: 0, z: 0, w: 1 },
      angular_velocity: { x: 0.1, y: 0.2, z: 0.3 },
      linear_acceleration: { x: 0, y: 0, z: 9.81 },
    };
    const result = imuMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.orientation.w).toBe(1);
      expect(result.data.angular_velocity?.x).toBe(0.1);
    }
  });

  it('parses a message with only orientation (optional fields omitted)', () => {
    const msg = { orientation: { x: 0, y: 0, z: 0.707, w: 0.707 } };
    const result = imuMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.angular_velocity).toBeUndefined();
      expect(result.data.linear_acceleration).toBeUndefined();
    }
  });

  it('rejects a message with missing orientation', () => {
    const msg = { angular_velocity: { x: 0, y: 0, z: 0 } };
    const result = imuMessageSchema.safeParse(msg);
    expect(result.success).toBe(false);
  });

  it('rejects an empty object', () => {
    const result = imuMessageSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects orientation with non-numeric fields', () => {
    const msg = { orientation: { x: 'bad', y: 0, z: 0, w: 1 } };
    const result = imuMessageSchema.safeParse(msg);
    expect(result.success).toBe(false);
  });

  it('rejects null', () => {
    const result = imuMessageSchema.safeParse(null);
    expect(result.success).toBe(false);
  });
});
