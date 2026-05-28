import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { WebRtcStats } from '@/hooks';

import { buildStatsSnapshot, detectDeployment, isStatsOverlayEnabled } from './helpers';

function makeStats(overrides: Partial<WebRtcStats> = {}): WebRtcStats {
  return {
    bytesReceived: 100_000,
    connectionState: 'connected',
    currentRoundTripTimeMs: 42,
    frameHeight: 480,
    framesDecoded: 1789,
    framesDropped: 2,
    framesPerSecond: 29.8,
    framesReceived: 1791,
    frameWidth: 640,
    iceConnectionState: 'connected',
    jitter: 0.0031,
    kbps: 380,
    packetLossRate: 0.001,
    packetsLost: 1,
    packetsReceived: 999,
    timestamp: Date.now(),
    ...overrides,
  };
}

describe('detectDeployment', () => {
  it('classifies localhost URLs as local', () => {
    expect(detectDeployment('ws://localhost:9090')).toBe('local');
    expect(detectDeployment('http://LOCALHOST:8080/rosbridge')).toBe('local');
  });

  it('classifies 127.0.0.1 URLs as local', () => {
    expect(detectDeployment('ws://127.0.0.1:9090')).toBe('local');
  });

  it('classifies *.local mDNS URLs as local', () => {
    expect(detectDeployment('ws://raspberrypi.local:9090')).toBe('local');
    expect(detectDeployment('http://robot.local/rosbridge')).toBe('local');
  });

  it('classifies remote URLs as cloud', () => {
    expect(detectDeployment('wss://example.com/rosbridge')).toBe('cloud');
    expect(detectDeployment('https://robot.cloudflare.example.com')).toBe('cloud');
  });

  it('does not match "local" as a substring outside of .local', () => {
    expect(detectDeployment('wss://locality.example.com')).toBe('cloud');
  });
});

describe('buildStatsSnapshot', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-19T20:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('produces the canonical snapshot shape', () => {
    const startedAtMs = Date.now() - 60_000;
    const snapshot = buildStatsSnapshot({
      startedAtMs,
      stats: makeStats(),
      url: 'ws://localhost:9090',
    });

    expect(snapshot).toEqual({
      connectionState: 'connected',
      deployment: 'local',
      duration_seconds: 60,
      fps: 29.8,
      framesDecoded: 1789,
      framesDropped: 2,
      jitter_ms: 3.1,
      kbps: 380,
      packetLossRate: 0.001,
      resolution: '640x480',
      rtt_ms: 42,
      timestamp: '2026-05-19T20:00:00.000Z',
    });
  });

  it('labels remote URLs as cloud deployment', () => {
    const snapshot = buildStatsSnapshot({
      startedAtMs: Date.now(),
      stats: makeStats(),
      url: 'wss://demo.example.com/rosbridge',
    });

    expect(snapshot.deployment).toBe('cloud');
  });

  it('returns null resolution when frame dimensions are missing', () => {
    const snapshot = buildStatsSnapshot({
      startedAtMs: Date.now(),
      stats: makeStats({ frameHeight: null, frameWidth: null }),
      url: 'ws://localhost',
    });

    expect(snapshot.resolution).toBeNull();
  });

  it('rounds duration to whole seconds and clamps negative deltas to 0', () => {
    const snapshot = buildStatsSnapshot({
      startedAtMs: Date.now() + 5000,
      stats: makeStats(),
      url: 'ws://localhost',
    });

    expect(snapshot.duration_seconds).toBe(0);
  });

  it('handles null stats fields without throwing', () => {
    const snapshot = buildStatsSnapshot({
      startedAtMs: Date.now(),
      stats: makeStats({
        currentRoundTripTimeMs: null,
        framesPerSecond: null,
        jitter: null,
        kbps: null,
        packetLossRate: null,
      }),
      url: 'ws://localhost',
    });

    expect(snapshot.fps).toBeNull();
    expect(snapshot.kbps).toBeNull();
    expect(snapshot.rtt_ms).toBeNull();
    expect(snapshot.jitter_ms).toBeNull();
    expect(snapshot.packetLossRate).toBeNull();
  });
});

describe('isStatsOverlayEnabled', () => {
  it('returns true in DEV builds regardless of localStorage', () => {
    // Vitest runs with import.meta.env.DEV === true by default
    expect(isStatsOverlayEnabled()).toBe(true);
  });
});
