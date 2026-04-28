import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useWebRtcStream/constants', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('exports DEFAULT_ICE_SERVERS with STUN and TURN servers', async () => {
    const { DEFAULT_ICE_SERVERS } = await import('./constants');

    const getFirstUrl = (s: RTCIceServer): string => {
      const urls = Array.isArray(s.urls) ? s.urls[0] : s.urls;
      return urls ?? '';
    };
    const stunServers = DEFAULT_ICE_SERVERS.filter((s) => getFirstUrl(s).startsWith('stun:'));
    const turnServers = DEFAULT_ICE_SERVERS.filter((s) => getFirstUrl(s).startsWith('turn:'));

    expect(stunServers).toHaveLength(2);
    expect(turnServers).toHaveLength(3);
    expect(DEFAULT_ICE_SERVERS).toHaveLength(5);
  });

  it('exports ICE_GATHERING_TIMEOUT of 5000ms', async () => {
    const { ICE_GATHERING_TIMEOUT } = await import('./constants');

    expect(ICE_GATHERING_TIMEOUT).toBe(5000);
  });

  it('exports MAX_VIDEO_BITRATE of 1.5 Mbps', async () => {
    const { MAX_VIDEO_BITRATE } = await import('./constants');

    expect(MAX_VIDEO_BITRATE).toBe(1_500_000);
  });

  it('exports PEER_CONNECTION_CONFIG with iceCandidatePoolSize', async () => {
    const { PEER_CONNECTION_CONFIG } = await import('./constants');

    expect(PEER_CONNECTION_CONFIG.iceCandidatePoolSize).toBe(10);
    expect(PEER_CONNECTION_CONFIG.iceServers).toBeDefined();
  });

  it('uses env vars for TURN when available', async () => {
    vi.stubEnv('VITE_TURN_URL', 'turn:my-turn.example.com:443');
    vi.stubEnv('VITE_TURN_USERNAME', 'testuser');
    vi.stubEnv('VITE_TURN_CREDENTIAL', 'testpass');

    const { DEFAULT_ICE_SERVERS } = await import('./constants');

    const getFirstUrl = (s: RTCIceServer): string => {
      const urls = Array.isArray(s.urls) ? s.urls[0] : s.urls;
      return urls ?? '';
    };
    const turnServers = DEFAULT_ICE_SERVERS.filter((s) => getFirstUrl(s).startsWith('turn:'));

    expect(turnServers).toHaveLength(1);
    expect(turnServers[0]).toEqual({
      credential: 'testpass',
      urls: 'turn:my-turn.example.com:443',
      username: 'testuser',
    });
  });
});
