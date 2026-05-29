import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useWebRtcStream } from './useWebRtcStream';

const mockSendOffer = vi.fn();

vi.mock('@/lib/webrtc/signaling', () => ({
  SignalingClient: vi.fn().mockImplementation(() => ({ sendOffer: mockSendOffer })),
}));

vi.mock('@/stores/connection/useConnectionStore.helpers', () => ({
  deriveWebRtcUrl: (url: string | undefined) => (url ? `${url}/webrtc` : ''),
}));

// Minimal RTCPeerConnection stand-in covering only the surface the hook touches. ICE
// gathering is reported as 'complete' so the hook's gather-or-timeout promise resolves
// synchronously instead of arming a real timer.
interface MockPc {
  onconnectionstatechange: (() => void) | null;
  onicegatheringstatechange: (() => void) | null;
  ontrack: ((ev: { streams: MediaStream[] }) => void) | null;
  connectionState: string;
  iceGatheringState: string;
  signalingState: string;
  localDescription: { type: string; sdp: string };
  addTransceiver: ReturnType<typeof vi.fn>;
  createOffer: ReturnType<typeof vi.fn>;
  setLocalDescription: ReturnType<typeof vi.fn>;
  setRemoteDescription: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
}

let lastPc: MockPc | null = null;

function createMockPc(): MockPc {
  const pc: MockPc = {
    onconnectionstatechange: null,
    onicegatheringstatechange: null,
    ontrack: null,
    connectionState: 'new',
    iceGatheringState: 'complete',
    signalingState: 'stable',
    localDescription: { type: 'offer', sdp: 'v=0\nm=video 9 UDP/TLS/RTP/SAVPF 96\n' },
    addTransceiver: vi.fn(),
    createOffer: vi
      .fn()
      .mockResolvedValue({ sdp: 'v=0\nm=video 9 UDP/TLS/RTP/SAVPF 96\n', type: 'offer' }),
    setLocalDescription: vi.fn().mockResolvedValue(undefined),
    setRemoteDescription: vi.fn().mockResolvedValue(undefined),
    close: vi.fn(),
  };
  lastPc = pc;
  return pc;
}

// Plain function declarations so `new` can construct them — arrow functions wrapped in
// vi.fn lack [[Construct]] and silently fail to fire when the hook does `new RTCPeerConnection()`.
function MockRtcPeerConnection(): MockPc {
  return createMockPc();
}
function MockRtcSessionDescription(init: { type: string; sdp?: string }): {
  type: string;
  sdp?: string;
} {
  return init;
}

async function flushAsync() {
  // connect() chains several awaits; flush enough microtasks so the chain settles.
  for (let i = 0; i < 10; i += 1) {
    await Promise.resolve();
  }
}

beforeEach(() => {
  lastPc = null;
  mockSendOffer.mockReset();
  vi.stubGlobal('RTCPeerConnection', MockRtcPeerConnection);
  vi.stubGlobal('RTCSessionDescription', MockRtcSessionDescription);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('useWebRtcStream', () => {
  it('starts idle and does not open a peer connection while disabled', () => {
    const { result } = renderHook(() =>
      useWebRtcStream({ connected: false, enabled: false, url: 'https://robot.example' }),
    );

    expect(result.current.status).toBe('idle');
    expect(result.current.stream).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.pc).toBeNull();
    expect(lastPc).toBeNull();
  });

  it('opens a peer connection when enabled and connected with a URL', async () => {
    mockSendOffer.mockResolvedValue({ type: 'answer', sdp: 'v=0\n' });

    renderHook(() =>
      useWebRtcStream({ connected: true, enabled: true, url: 'https://robot.example' }),
    );

    await act(async () => {
      await flushAsync();
    });

    expect(lastPc).not.toBeNull();
    expect(lastPc?.addTransceiver).toHaveBeenCalledWith('video', { direction: 'recvonly' });
  });

  it('does not double-schedule reconnect when both failure paths fire for one failure', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    mockSendOffer.mockRejectedValue(new Error('signaling failed'));

    renderHook(() =>
      useWebRtcStream({ connected: true, enabled: true, url: 'https://robot.example' }),
    );

    await act(async () => {
      await flushAsync();
    });

    // The connect() catch ran and scheduled exactly one reconnect timer.
    expect(vi.getTimerCount()).toBe(1);

    // Now simulate the second failure path: connectionstatechange 'failed' on the same pc.
    // Without the guard this would schedule a second reconnect, leaking a timer and burning
    // the retry budget twice.
    expect(lastPc).not.toBeNull();
    act(() => {
      if (!lastPc) return;
      lastPc.connectionState = 'failed';
      lastPc.onconnectionstatechange?.();
    });

    expect(vi.getTimerCount()).toBe(1);
  });
});
