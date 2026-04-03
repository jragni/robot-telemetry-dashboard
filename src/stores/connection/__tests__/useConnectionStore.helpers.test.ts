import { describe, it, expect } from 'vitest';
import {
  assignRobotColor,
  deriveRosbridgeUrl,
  deriveWebRtcUrl,
  toRobotId,
} from '../useConnectionStore.helpers';

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

describe('deriveRosbridgeUrl', () => {
  it('appends /rosbridge to a base URL', () => {
    expect(deriveRosbridgeUrl('http://10.0.0.1:8080')).toBe('http://10.0.0.1:8080/rosbridge');
  });

  it('strips trailing slash before appending', () => {
    expect(deriveRosbridgeUrl('http://10.0.0.1:8080/')).toBe('http://10.0.0.1:8080/rosbridge');
  });

  it('returns empty string for empty input', () => {
    expect(deriveRosbridgeUrl('')).toBe('');
  });
});

describe('deriveWebRtcUrl', () => {
  it('appends /webrtc to a base URL', () => {
    expect(deriveWebRtcUrl('http://10.0.0.1:8080')).toBe('http://10.0.0.1:8080/webrtc');
  });

  it('strips trailing slash before appending', () => {
    expect(deriveWebRtcUrl('http://10.0.0.1:8080/')).toBe('http://10.0.0.1:8080/webrtc');
  });

  it('returns empty string for empty input', () => {
    expect(deriveWebRtcUrl('')).toBe('');
  });
});

describe('assignRobotColor', () => {
  it('returns the same color for the same name', () => {
    const color1 = assignRobotColor('Atlas');
    const color2 = assignRobotColor('Atlas');
    expect(color1).toBe(color2);
  });

  it('returns a valid RobotColor', () => {
    const validColors = [
      'blue', 'cyan', 'green', 'amber', 'red', 'purple',
      'teal', 'orange', 'pink', 'lime', 'indigo', 'rose',
    ];
    const color = assignRobotColor('TestBot');
    expect(validColors).toContain(color);
  });

  it('returns different colors for different names', () => {
    const colors = new Set([
      assignRobotColor('Alpha'),
      assignRobotColor('Beta'),
      assignRobotColor('Gamma'),
      assignRobotColor('Delta'),
    ]);
    expect(colors.size).toBeGreaterThan(1);
  });
});
