import { describe, expect, it } from 'vitest';
import { batteryStateMessageSchema } from './schemas';

describe('batteryStateMessageSchema', () => {
  it('parses a valid BatteryState message', () => {
    const msg = { percentage: 0.85, voltage: 12.6, power_supply_status: 1 };
    const result = batteryStateMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.percentage).toBe(0.85);
      expect(result.data.voltage).toBe(12.6);
      expect(result.data.power_supply_status).toBe(1);
    }
  });

  it('parses a message with percentage as 0-100 scale', () => {
    const msg = { percentage: 85, voltage: 12.6, power_supply_status: 0 };
    const result = batteryStateMessageSchema.safeParse(msg);
    expect(result.success).toBe(true);
  });

  it('rejects a message missing voltage', () => {
    const msg = { percentage: 0.85, power_supply_status: 1 };
    const result = batteryStateMessageSchema.safeParse(msg);
    expect(result.success).toBe(false);
  });

  it('rejects an empty object', () => {
    const result = batteryStateMessageSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric percentage', () => {
    const msg = { percentage: 'full', voltage: 12.6, power_supply_status: 1 };
    const result = batteryStateMessageSchema.safeParse(msg);
    expect(result.success).toBe(false);
  });

  it('rejects null', () => {
    const result = batteryStateMessageSchema.safeParse(null);
    expect(result.success).toBe(false);
  });
});
