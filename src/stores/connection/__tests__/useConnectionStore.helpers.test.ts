import { assignRobotColor, deriveRosbridgeUrl, deriveWebRtcUrl } from '@/stores/connection/useConnectionStore.helpers';
import { normalizeRosbridgeUrl } from '@/features/fleet/helpers';

describe('normalizeRosbridgeUrl', () => {
  it('returns empty string for blank input', () => {
    expect(normalizeRosbridgeUrl('')).toBe('');
    expect(normalizeRosbridgeUrl('   ')).toBe('');
  });

  it('prepends wss:// to bare IP addresses', () => {
    expect(normalizeRosbridgeUrl('192.168.1.10')).toBe('wss://192.168.1.10');
  });

  it('prepends wss:// to bare hostnames', () => {
    expect(normalizeRosbridgeUrl('robot.local')).toBe('wss://robot.local');
  });

  it('preserves ws:// scheme', () => {
    expect(normalizeRosbridgeUrl('ws://192.168.1.10')).toBe('ws://192.168.1.10');
  });

  it('preserves wss:// scheme', () => {
    expect(normalizeRosbridgeUrl('wss://192.168.1.10')).toBe('wss://192.168.1.10');
  });

  it('converts https:// to wss://', () => {
    expect(normalizeRosbridgeUrl('https://robot.example.com')).toBe('wss://robot.example.com');
  });

  it('converts http:// to ws://', () => {
    expect(normalizeRosbridgeUrl('http://robot.local:9090')).toBe('ws://robot.local:9090');
  });

  it('preserves trailing path', () => {
    expect(normalizeRosbridgeUrl('ws://robot.local:9090/rosbridge')).toBe(
      'ws://robot.local:9090/rosbridge',
    );
  });

  it('returns empty string for completely invalid input', () => {
    expect(normalizeRosbridgeUrl('://broken')).toBe('');
  });
});

describe('assignRobotColor', () => {
  const VALID_COLORS = [
    'blue', 'cyan', 'green', 'amber', 'red', 'purple',
    'teal', 'orange', 'pink', 'lime', 'indigo', 'rose',
  ];

  it('returns a valid robot color', () => {
    const color = assignRobotColor('robot-1');
    expect(VALID_COLORS).toContain(color);
  });

  it('returns consistent color for the same name', () => {
    const a = assignRobotColor('atlas');
    const b = assignRobotColor('atlas');
    expect(a).toBe(b);
  });

  it('returns different colors for different names', () => {
    const colors = new Set(
      ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot'].map(assignRobotColor),
    );
    expect(colors.size).toBeGreaterThan(1);
  });

  it('always returns a valid color from the palette', () => {
    const testNames = ['a', 'bb', 'ccc', '', 'x'.repeat(100)];
    for (const name of testNames) {
      expect(VALID_COLORS).toContain(assignRobotColor(name));
    }
  });
});

describe('deriveRosbridgeUrl', () => {
  it('appends /rosbridge to the base URL', () => {
    expect(deriveRosbridgeUrl('ws://192.168.1.10')).toBe('ws://192.168.1.10/rosbridge');
  });

  it('strips trailing slash before appending', () => {
    expect(deriveRosbridgeUrl('ws://192.168.1.10/')).toBe('ws://192.168.1.10/rosbridge');
  });

  it('returns empty string for empty input', () => {
    expect(deriveRosbridgeUrl('')).toBe('');
  });
});

describe('deriveWebRtcUrl', () => {
  it('appends /webrtc to the base URL', () => {
    expect(deriveWebRtcUrl('ws://192.168.1.10')).toBe('ws://192.168.1.10/webrtc');
  });

  it('strips trailing slash before appending', () => {
    expect(deriveWebRtcUrl('ws://192.168.1.10/')).toBe('ws://192.168.1.10/webrtc');
  });

  it('returns empty string for empty input', () => {
    expect(deriveWebRtcUrl('')).toBe('');
  });
});
