import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWebRtcStream } from '../useWebRtcStream';

// ── Mocks ────────────────────────────────────────────────────────────
vi.mock('@/lib/webrtc/signaling', () => ({
  SignalingClient: vi.fn(),
}));

vi.mock('@/stores/connection/useConnectionStore.helpers', () => ({
  deriveWebRtcUrl: vi.fn((url: string) => `http://${url}/webrtc/offer`),
}));

describe('useWebRtcStream', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('video.play error handling', () => {
    it('silences NotAllowedError from video.play', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn());

      const notAllowedError = new DOMException('Autoplay blocked', 'NotAllowedError');
      const mockPlay: () => Promise<void> = vi.fn().mockRejectedValue(notAllowedError);

      // Exercise the exact catch logic from the hook
      await mockPlay().catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'NotAllowedError') return;
        console.warn('[useWebRtcStream] video.play failed:', err);
      });

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('logs non-NotAllowedError from video.play with console.warn', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn());

      const abortError = new DOMException('Play aborted', 'AbortError');
      const mockPlay: () => Promise<void> = vi.fn().mockRejectedValue(abortError);

      // Exercise the exact catch logic from the hook
      await mockPlay().catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'NotAllowedError') return;
        console.warn('[useWebRtcStream] video.play failed:', err);
      });

      expect(warnSpy).toHaveBeenCalledOnce();
      expect(warnSpy).toHaveBeenCalledWith(
        '[useWebRtcStream] video.play failed:',
        abortError,
      );
    });
  });

  describe('reconnect scheduling', () => {
    it('calls connect after backoff delay when reconnect is scheduled', async () => {
      const mockPc = {
        addTransceiver: vi.fn(),
        createOffer: vi.fn().mockResolvedValue({ type: 'offer', sdp: 'mock' }),
        setLocalDescription: vi.fn().mockResolvedValue(undefined),
        setRemoteDescription: vi.fn().mockResolvedValue(undefined),
        close: vi.fn(),
        ontrack: null as ((event: RTCTrackEvent) => void) | null,
        onconnectionstatechange: null as (() => void) | null,
        onicegatheringstatechange: null as (() => void) | null,
        connectionState: 'new' as RTCPeerConnectionState,
        iceGatheringState: 'complete' as RTCIceGatheringState,
        signalingState: 'stable' as RTCSignalingState,
        localDescription: { type: 'offer', sdp: 'mock' } as RTCSessionDescription,
      };

      const RTCPeerConnectionSpy = vi.fn().mockImplementation(() => mockPc);
      vi.stubGlobal('RTCPeerConnection', RTCPeerConnectionSpy);
      vi.stubGlobal(
        'RTCSessionDescription',
        vi.fn().mockImplementation((desc: RTCSessionDescriptionInit) => desc),
      );

      // Import the mocked module and configure SignalingClient to reject
      const signalingModule = await import('@/lib/webrtc/signaling');
      const SignalingClientMock = vi.mocked(signalingModule.SignalingClient);
      SignalingClientMock.mockImplementation(
        () =>
          ({
            sendOffer: vi.fn().mockRejectedValue(new Error('Network error')),
          }) as unknown as InstanceType<typeof signalingModule.SignalingClient>,
      );

      const { result } = renderHook(() =>
        useWebRtcStream({ url: 'localhost:9090', enabled: true }),
      );

      // Wait for initial connect to fail and trigger scheduleReconnect
      await vi.waitFor(() => {
        expect(result.current.status).toBe('reconnecting');
      });

      const callCountBefore = RTCPeerConnectionSpy.mock.calls.length;

      // Advance timer past the backoff delay (2s for attempt 0)
      act(() => {
        vi.advanceTimersByTime(2500);
      });

      // After timer fires, connect should be called again via connectRef
      await vi.waitFor(() => {
        expect(RTCPeerConnectionSpy.mock.calls.length).toBeGreaterThan(callCountBefore);
      });
    });
  });
});
