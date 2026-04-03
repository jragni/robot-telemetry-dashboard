import { describe, expect, it } from 'vitest';

import { getBatteryColor } from './getBatteryColor';

describe('getBatteryColor', () => {
  it('returns nominal for full charge', () => {
    expect(getBatteryColor(100)).toBe('text-status-nominal');
  });

  it('returns nominal for values above 30', () => {
    expect(getBatteryColor(31)).toBe('text-status-nominal');
    expect(getBatteryColor(75)).toBe('text-status-nominal');
  });

  it('returns caution at boundary value 30', () => {
    expect(getBatteryColor(30)).toBe('text-status-caution');
  });

  it('returns caution for values between 16 and 30', () => {
    expect(getBatteryColor(16)).toBe('text-status-caution');
    expect(getBatteryColor(20)).toBe('text-status-caution');
  });

  it('returns critical at boundary value 15', () => {
    expect(getBatteryColor(15)).toBe('text-status-critical');
  });

  it('returns critical for values below 15', () => {
    expect(getBatteryColor(0)).toBe('text-status-critical');
    expect(getBatteryColor(5)).toBe('text-status-critical');
    expect(getBatteryColor(14)).toBe('text-status-critical');
  });

  it('returns muted for null input', () => {
    expect(getBatteryColor(null)).toBe('text-text-muted');
  });

  it('returns muted for NaN input', () => {
    expect(getBatteryColor(NaN)).toBe('text-text-muted');
  });

  it('handles negative values as critical', () => {
    expect(getBatteryColor(-1)).toBe('text-status-critical');
  });
});
