import { describe, it, expect } from 'vitest';
import { toRobotId } from '../useConnectionStore.helpers';

describe('toRobotId', () => {
  it('collapses whitespace into single hyphens', () => {
    expect(toRobotId('Atlas  01')).toBe('atlas-01');
  });

  it('strips special characters', () => {
    expect(toRobotId('atlas/01!')).toBe('atlas01');
  });

  it('collapses repeated hyphens', () => {
    expect(toRobotId('my--robot')).toBe('my-robot');
  });

  it('trims leading and trailing hyphens and whitespace', () => {
    expect(toRobotId('  --foo-- ')).toBe('foo');
  });

  it('returns empty string for empty input', () => {
    expect(toRobotId('')).toBe('');
  });

  it('strips non-ASCII characters', () => {
    expect(toRobotId('Röbot')).toBe('rbot');
  });

  it('handles a simple name', () => {
    expect(toRobotId('Atlas')).toBe('atlas');
  });

  it('handles mixed whitespace and special chars', () => {
    expect(toRobotId('  My Robot!! v2  ')).toBe('my-robot-v2');
  });

  it('preserves digits', () => {
    expect(toRobotId('robot123')).toBe('robot123');
  });
});
