import { formatUptime } from '@/utils/formatUptime';

describe('formatUptime', () => {
  it('returns em dash for null', () => {
    expect(formatUptime(null)).toBe('—');
  });

  it('formats 0 seconds as 00:00:00', () => {
    expect(formatUptime(0)).toBe('00:00:00');
  });

  it('formats seconds only', () => {
    expect(formatUptime(59)).toBe('00:00:59');
    expect(formatUptime(1)).toBe('00:00:01');
  });

  it('formats exactly 1 minute', () => {
    expect(formatUptime(60)).toBe('00:01:00');
  });

  it('formats minutes and seconds', () => {
    expect(formatUptime(125)).toBe('00:02:05');
  });

  it('formats exactly 1 hour', () => {
    expect(formatUptime(3600)).toBe('01:00:00');
  });

  it('formats mixed hours, minutes, and seconds', () => {
    expect(formatUptime(3661)).toBe('01:01:01');
    expect(formatUptime(7325)).toBe('02:02:05');
  });

  it('formats large hour values', () => {
    expect(formatUptime(86400)).toBe('24:00:00');
    expect(formatUptime(360000)).toBe('100:00:00');
  });

  it('truncates fractional seconds', () => {
    expect(formatUptime(59.9)).toBe('00:00:59');
  });
});
