import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useWebRtcStats } from './useWebRtcStats';

interface StatLike {
  readonly type: string;
  readonly [key: string]: unknown;
}

function makeStatsReport(stats: StatLike[]): RTCStatsReport {
  const map = new Map<string, StatLike>();
  stats.forEach((stat, index) => {
    map.set(`id-${String(index)}`, stat);
  });
  return map as unknown as RTCStatsReport;
}

function makeMockPc(reports: RTCStatsReport[]): {
  pc: RTCPeerConnection;
  getStats: ReturnType<typeof vi.fn>;
} {
  let call = 0;
  const getStats = vi.fn(() => {
    const report = reports[Math.min(call, reports.length - 1)];
    call += 1;
    return Promise.resolve(report);
  });

  const pc = {
    connectionState: 'connected',
    getStats,
    iceConnectionState: 'connected',
  } as unknown as RTCPeerConnection;

  return { getStats, pc };
}

/** Flushes microtasks so a resolved getStats() Promise can update state.
 * Wrapped in act() so React batches the resulting setState call. */
async function flushPromises(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('useWebRtcStats', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns null before first poll completes', () => {
    const { pc } = makeMockPc([makeStatsReport([])]);
    const { result } = renderHook(() => useWebRtcStats(pc));

    expect(result.current).toBeNull();
  });

  it('returns null when pc is null', async () => {
    const { result } = renderHook(() => useWebRtcStats(null));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(result.current).toBeNull();
  });

  it('populates snapshot from inbound-rtp video report', async () => {
    const report = makeStatsReport([
      {
        bytesReceived: 100_000,
        frameHeight: 480,
        framesDecoded: 60,
        framesDropped: 2,
        framesPerSecond: 30,
        framesReceived: 62,
        frameWidth: 640,
        jitter: 0.003,
        kind: 'video',
        packetsLost: 1,
        packetsReceived: 999,
        type: 'inbound-rtp',
      },
    ]);
    const { pc } = makeMockPc([report]);

    const { result } = renderHook(() => useWebRtcStats(pc));

    await flushPromises();

    expect(result.current?.framesPerSecond).toBe(30);
    expect(result.current?.frameWidth).toBe(640);
    expect(result.current?.frameHeight).toBe(480);
    expect(result.current?.framesReceived).toBe(62);
    expect(result.current?.framesDecoded).toBe(60);
    expect(result.current?.framesDropped).toBe(2);
    expect(result.current?.bytesReceived).toBe(100_000);
    expect(result.current?.jitter).toBeCloseTo(0.003);
    expect(result.current?.packetsLost).toBe(1);
    expect(result.current?.packetLossRate).toBeCloseTo(1 / 1000);
    expect(result.current?.connectionState).toBe('connected');
  });

  it('computes kbps correctly from delta of bytesReceived across two polls', async () => {
    const reports = [
      makeStatsReport([{ bytesReceived: 100_000, kind: 'video', type: 'inbound-rtp' }]),
      makeStatsReport([{ bytesReceived: 200_000, kind: 'video', type: 'inbound-rtp' }]),
    ];
    const { pc } = makeMockPc(reports);

    const nowSpy = vi.spyOn(Date, 'now');
    nowSpy.mockReturnValueOnce(1_000_000);
    nowSpy.mockReturnValueOnce(1_001_000);

    const { result } = renderHook(() => useWebRtcStats(pc, 1000));

    await flushPromises();
    expect(result.current?.kbps).toBeNull();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    await flushPromises();

    // Delta = 100,000 bytes over 1s = 800,000 bits/s = 800 kbps
    expect(result.current?.kbps).toBe(800);
  });

  it('extracts currentRoundTripTime from nominated succeeded candidate-pair', async () => {
    const report = makeStatsReport([
      { bytesReceived: 0, kind: 'video', type: 'inbound-rtp' },
      {
        currentRoundTripTime: 0.999,
        nominated: false,
        state: 'succeeded',
        type: 'candidate-pair',
      },
      {
        currentRoundTripTime: 0.042,
        nominated: true,
        state: 'succeeded',
        type: 'candidate-pair',
      },
    ]);
    const { pc } = makeMockPc([report]);

    const { result } = renderHook(() => useWebRtcStats(pc));

    await flushPromises();

    expect(result.current?.currentRoundTripTimeMs).toBe(42);
  });

  it('falls back to non-nominated succeeded pair when no nominated pair exists', async () => {
    const report = makeStatsReport([
      { bytesReceived: 0, kind: 'video', type: 'inbound-rtp' },
      {
        currentRoundTripTime: 0.025,
        nominated: false,
        state: 'succeeded',
        type: 'candidate-pair',
      },
    ]);
    const { pc } = makeMockPc([report]);

    const { result } = renderHook(() => useWebRtcStats(pc));

    await flushPromises();

    expect(result.current?.currentRoundTripTimeMs).toBe(25);
  });

  it('stops polling when pc becomes null', async () => {
    const { getStats, pc } = makeMockPc([
      makeStatsReport([{ bytesReceived: 0, kind: 'video', type: 'inbound-rtp' }]),
    ]);

    const { rerender } = renderHook(
      ({ peer }: { peer: RTCPeerConnection | null }) => useWebRtcStats(peer),
      { initialProps: { peer: pc as RTCPeerConnection | null } },
    );

    await flushPromises();
    const callsBeforeNull = getStats.mock.calls.length;
    expect(callsBeforeNull).toBeGreaterThan(0);

    rerender({ peer: null });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(getStats.mock.calls.length).toBe(callsBeforeNull);
  });

  it('stops polling on unmount', async () => {
    const { getStats, pc } = makeMockPc([
      makeStatsReport([{ bytesReceived: 0, kind: 'video', type: 'inbound-rtp' }]),
    ]);

    const { unmount } = renderHook(() => useWebRtcStats(pc));

    await flushPromises();
    const callsBeforeUnmount = getStats.mock.calls.length;
    expect(callsBeforeUnmount).toBeGreaterThan(0);

    unmount();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(getStats.mock.calls.length).toBe(callsBeforeUnmount);
  });

  it('clears stats when pc transitions to null', async () => {
    const { pc } = makeMockPc([
      makeStatsReport([
        { bytesReceived: 100, framesPerSecond: 30, kind: 'video', type: 'inbound-rtp' },
      ]),
    ]);

    const { rerender, result } = renderHook(
      ({ peer }: { peer: RTCPeerConnection | null }) => useWebRtcStats(peer),
      { initialProps: { peer: pc as RTCPeerConnection | null } },
    );

    await flushPromises();
    expect(result.current).not.toBeNull();

    rerender({ peer: null });
    await flushPromises();

    expect(result.current).toBeNull();
  });
});
