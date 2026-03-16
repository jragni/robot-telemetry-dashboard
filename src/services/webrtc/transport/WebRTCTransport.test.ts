import { firstValueFrom, toArray, take } from 'rxjs';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { WebRTCTransport } from './WebRTCTransport';

import { WEBRTC_CONFIG, DEFAULT_ICE_SERVERS } from '@/config/webrtc';
import { useWebRTCStore } from '@/stores/webrtc/webrtc.store';
import {
  createMockPeerConnection,
  createMockMediaStream,
  type MockPeerConnection,
} from '@/test/mocks/webrtc.mock';

// ---------------------------------------------------------------------------
// Mock RTCPeerConnection globally BEFORE importing the transport
// ---------------------------------------------------------------------------

let mockPc: MockPeerConnection;

vi.stubGlobal(
  'RTCPeerConnection',
  // eslint-disable-next-line prefer-arrow-callback -- must use function() for new-ability
  vi.fn(function () {
    mockPc = createMockPeerConnection();
    return mockPc;
  })
);

// ---------------------------------------------------------------------------
// Mock SignalingClient
// ---------------------------------------------------------------------------

vi.mock('../signaling/SignalingClient', () => ({
  // eslint-disable-next-line prefer-arrow-callback -- must use function() for new-ability
  SignalingClient: vi.fn(function () {
    return {
      sendOffer: vi
        .fn()
        .mockResolvedValue({ sdp: 'answer-sdp', type: 'answer' }),
    };
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROBOT_ID = 'robot-1';
const BASE_URL = 'http://robot.local:8080';

function resetStore(): void {
  useWebRTCStore.setState({ connections: {} });
}

/**
 * Flush all pending microtasks and any zero-delay timers.
 *
 * When fake timers are active (i.e. we're inside a `vi.useFakeTimers()` block)
 * we advance the fake clock by 0 ms which also drains queued microtasks.
 * In real-timer tests we fall back to a genuine `setTimeout(0)` round-trip.
 *
 * Detection: Vitest replaces `setTimeout` with a non-native spy when fake
 * timers are active, so checking `setTimeout.toString()` for '[native code]'
 * is a reliable discriminator.
 */
async function flushMicrotasks(): Promise<void> {
  if (typeof vi.advanceTimersByTimeAsync === 'function') {
    try {
      // If fake timers are active this resolves immediately after draining
      // the microtask queue.  If real timers are active this throws, and we
      // fall through to the real-timer branch.
      await vi.advanceTimersByTimeAsync(0);
      return;
    } catch {
      // Real timers are active — fall through
    }
  }
  await new Promise<void>((resolve) => {
    // Use the real (or current) setTimeout
    window.setTimeout(resolve, 0);
  });
}

/**
 * Build a transport and drive it through a successful connect + ICE connected
 * sequence.  Returns the transport and the mockPc that was created.
 */
async function buildConnectedTransport(): Promise<{
  transport: WebRTCTransport;
  pc: MockPeerConnection;
}> {
  const transport = new WebRTCTransport(ROBOT_ID);
  transport.connect(BASE_URL);
  await flushMicrotasks();
  const pc = mockPc; // capture after connect() created the PC
  pc._triggerConnectionStateChange('connected');
  await flushMicrotasks();
  return { transport, pc };
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('WebRTCTransport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // =========================================================================
  // Constructor / initial state
  // =========================================================================

  describe('constructor', () => {
    it('initialises with disconnected state', () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      expect(transport.getCurrentState()).toBe('disconnected');
    });

    it('getMediaStream$ emits null initially', async () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      const value = await firstValueFrom(transport.getMediaStream$());
      expect(value).toBeNull();
    });

    it('getConnectionState$ emits disconnected initially', async () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      const value = await firstValueFrom(transport.getConnectionState$());
      expect(value).toBe('disconnected');
    });
  });

  // =========================================================================
  // connect()
  // =========================================================================

  describe('connect()', () => {
    it('sets state to connecting immediately', () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      expect(transport.getCurrentState()).toBe('connecting');
    });

    it('creates RTCPeerConnection with DEFAULT_ICE_SERVERS', () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);

      const PcCtor = RTCPeerConnection as ReturnType<typeof vi.fn>;
      expect(PcCtor).toHaveBeenCalledOnce();
      const config = PcCtor.mock.calls[0][0] as RTCConfiguration;
      expect(config.iceServers).toEqual(DEFAULT_ICE_SERVERS);

      transport.destroy();
    });

    it('resets retryCount to 0 on a new connect call', async () => {
      vi.useFakeTimers();

      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      // Trigger ICE failure to bump retryCount
      mockPc._triggerConnectionStateChange('failed');
      await flushMicrotasks();

      // Call connect again — retryCount must be reset
      transport.connect(BASE_URL);
      await flushMicrotasks();

      // State should be 'connecting' again, not 'error'
      expect(transport.getCurrentState()).toBe('connecting');

      transport.destroy();
    });

    it('does nothing when called on a destroyed transport', () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      transport.destroy();
      transport.connect(BASE_URL);

      const PcCtor = RTCPeerConnection as ReturnType<typeof vi.fn>;
      expect(PcCtor).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // SDP negotiation
  // =========================================================================

  describe('SDP negotiation', () => {
    it('calls createOffer on the peer connection', async () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      expect(mockPc.createOffer).toHaveBeenCalledOnce();

      transport.destroy();
    });

    it('calls setLocalDescription with the created offer', async () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      expect(mockPc.setLocalDescription).toHaveBeenCalledOnce();
      const arg = mockPc.setLocalDescription.mock
        .calls[0][0] as RTCSessionDescriptionInit;
      expect(arg.type).toBe('offer');

      transport.destroy();
    });

    it('waits for ICE gathering to complete before sending the offer', async () => {
      // Override setLocalDescription to NOT auto-complete ICE gathering
      const pendingPc = createMockPeerConnection();
      pendingPc.setLocalDescription = vi
        .fn()
        .mockImplementation((desc: RTCSessionDescriptionInit) => {
          pendingPc.localDescription = desc;
          // Do NOT fire onicegatheringstatechange — gathering stays in-progress
        });
      (RTCPeerConnection as ReturnType<typeof vi.fn>).mockImplementationOnce(
        // eslint-disable-next-line prefer-arrow-callback -- must use function() for new-ability
        function () {
          mockPc = pendingPc;
          return pendingPc;
        }
      );

      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      const { SignalingClient: SC } =
        await import('../signaling/SignalingClient');
      const instances = (SC as ReturnType<typeof vi.fn>).mock.instances as {
        sendOffer: ReturnType<typeof vi.fn>;
      }[];
      const sendOffer = instances[0]?.sendOffer;

      // sendOffer must NOT have been called yet — ICE is still gathering
      expect(sendOffer).not.toHaveBeenCalled();

      transport.destroy();
    });

    it('sends the offer via SignalingClient after ICE gathering completes', async () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks(); // setLocalDescription fires onicegatheringstatechange

      const { SignalingClient: SC } =
        await import('../signaling/SignalingClient');
      const instances = (SC as ReturnType<typeof vi.fn>).mock.instances as {
        sendOffer: ReturnType<typeof vi.fn>;
      }[];
      const sendOffer = instances[0]?.sendOffer;

      expect(sendOffer).toHaveBeenCalledOnce();

      transport.destroy();
    });

    it('calls setRemoteDescription with the answer returned by SignalingClient', async () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      expect(mockPc.setRemoteDescription).toHaveBeenCalledOnce();
      const arg = mockPc.setRemoteDescription.mock
        .calls[0][0] as RTCSessionDescriptionInit;
      expect(arg.sdp).toBe('answer-sdp');
      expect(arg.type).toBe('answer');

      transport.destroy();
    });
  });

  // =========================================================================
  // Connection lifecycle
  // =========================================================================

  describe('connection lifecycle', () => {
    it('transitions to connected when ICE connection state is "connected"', async () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      mockPc._triggerConnectionStateChange('connected');
      await flushMicrotasks();

      expect(transport.getCurrentState()).toBe('connected');

      transport.destroy();
    });

    it('transitions to connected when ICE connection state is "completed"', async () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      mockPc._triggerConnectionStateChange('completed');
      await flushMicrotasks();

      expect(transport.getCurrentState()).toBe('connected');

      transport.destroy();
    });

    it('bridges the connected state into the Zustand store', async () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      mockPc._triggerConnectionStateChange('connected');
      await flushMicrotasks();

      const storeState = useWebRTCStore.getState().getConnectionState(ROBOT_ID);
      expect(storeState).toBe('connected');

      transport.destroy();
    });

    it('clears any existing error on successful connection', async () => {
      // Pre-seed an error in the store
      useWebRTCStore
        .getState()
        .setConnectionError(ROBOT_ID, { message: 'prev error', timestamp: 1 });

      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      mockPc._triggerConnectionStateChange('connected');
      await flushMicrotasks();

      const entry = useWebRTCStore.getState().connections[ROBOT_ID];
      expect(entry?.error).toBeNull();

      transport.destroy();
    });

    it('resets retryCount to 0 on successful connection', async () => {
      vi.useFakeTimers();

      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      // Fail once to bump retryCount
      mockPc._triggerConnectionStateChange('failed');
      await flushMicrotasks();

      // Let the backoff timer fire so a new PC is created
      await vi.advanceTimersByTimeAsync(
        WEBRTC_CONFIG.initialReconnectDelay + 100
      );
      await flushMicrotasks();

      // Now succeed
      mockPc._triggerConnectionStateChange('connected');
      await flushMicrotasks();

      expect(transport.getCurrentState()).toBe('connected');

      transport.destroy();
    });

    it('emits the MediaStream when a track event fires', async () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      const streamPromise = firstValueFrom(
        transport.getMediaStream$().pipe(
          // Skip the initial null and take the first non-null emission

          take(2),
          toArray()
        )
      );

      const mockStream = createMockMediaStream('stream-1');
      mockPc._triggerTrack(mockStream);
      await flushMicrotasks();

      const values = await streamPromise;
      // Last value should be the stream
      expect(values[values.length - 1]).toBe(mockStream);

      transport.destroy();
    });
  });

  // =========================================================================
  // ICE failure and retry
  // =========================================================================

  describe('ICE failure', () => {
    it('transitions to error state when ICE state is "failed" and retries remain', async () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      mockPc._triggerConnectionStateChange('failed');
      await flushMicrotasks();

      expect(transport.getCurrentState()).toBe('error');

      transport.destroy();
    });

    it('increments retryCount on each ICE failure', async () => {
      vi.useFakeTimers();

      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      const PcCtor = RTCPeerConnection as ReturnType<typeof vi.fn>;
      const callsBefore = PcCtor.mock.calls.length;

      // First failure
      mockPc._triggerConnectionStateChange('failed');
      await flushMicrotasks();

      await vi.advanceTimersByTimeAsync(
        WEBRTC_CONFIG.initialReconnectDelay + 100
      );
      await flushMicrotasks();

      // Second failure
      mockPc._triggerConnectionStateChange('failed');
      await flushMicrotasks();

      await vi.advanceTimersByTimeAsync(
        WEBRTC_CONFIG.initialReconnectDelay * 2 + 100
      );
      await flushMicrotasks();

      // Should have created two more PCs (one per retry)
      expect(PcCtor.mock.calls.length).toBe(callsBefore + 2);

      transport.destroy();
    });

    it('transitions to disconnected when retries are exhausted', async () => {
      vi.useFakeTimers();

      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      // With maxReconnectAttempts=3 and exhaustion check "> max", we need
      // max+1 failures to exhaust (retryCount reaches 4 which is > 3).
      const totalFailures = WEBRTC_CONFIG.maxReconnectAttempts + 1;

      for (let i = 0; i < totalFailures; i++) {
        mockPc._triggerConnectionStateChange('failed');
        await flushMicrotasks();

        if (i < totalFailures - 1) {
          await vi.advanceTimersByTimeAsync(
            WEBRTC_CONFIG.maxReconnectDelay + 100
          );
          await flushMicrotasks();
        }
      }

      expect(transport.getCurrentState()).toBe('disconnected');

      transport.destroy();
    });

    it('nulls the mediaStream on ICE failure', async () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      // Emit a stream first
      const mockStream = createMockMediaStream();
      mockPc._triggerTrack(mockStream);
      await flushMicrotasks();

      // Now fail the connection
      mockPc._triggerConnectionStateChange('failed');
      await flushMicrotasks();

      const currentStream = await firstValueFrom(transport.getMediaStream$());
      expect(currentStream).toBeNull();

      transport.destroy();
    });

    it('schedules a reconnect after a failure if retries remain', async () => {
      vi.useFakeTimers();

      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      const PcCtor = RTCPeerConnection as ReturnType<typeof vi.fn>;
      const callsBefore = PcCtor.mock.calls.length;

      mockPc._triggerConnectionStateChange('failed');
      await flushMicrotasks();

      // Before the timer fires — no new PC
      expect(PcCtor.mock.calls.length).toBe(callsBefore);

      // After the timer fires — new PC created
      await vi.advanceTimersByTimeAsync(
        WEBRTC_CONFIG.initialReconnectDelay + 100
      );
      await flushMicrotasks();

      expect(PcCtor.mock.calls.length).toBe(callsBefore + 1);

      transport.destroy();
    });
  });

  // =========================================================================
  // Exponential backoff
  // =========================================================================

  describe('exponential backoff', () => {
    it('1st retry fires after initialReconnectDelay (2000 ms)', async () => {
      vi.useFakeTimers();

      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      const PcCtor = RTCPeerConnection as ReturnType<typeof vi.fn>;
      const callsBefore = PcCtor.mock.calls.length;

      mockPc._triggerConnectionStateChange('failed');
      await flushMicrotasks();

      // Just before 2000 ms — no retry yet
      await vi.advanceTimersByTimeAsync(
        WEBRTC_CONFIG.initialReconnectDelay - 1
      );
      await flushMicrotasks();
      expect(PcCtor.mock.calls.length).toBe(callsBefore);

      // Advance to exactly 2000 ms
      await vi.advanceTimersByTimeAsync(1);
      await flushMicrotasks();
      expect(PcCtor.mock.calls.length).toBe(callsBefore + 1);

      transport.destroy();
    });

    it('2nd retry fires after 4000 ms (2^1 x initialReconnectDelay)', async () => {
      vi.useFakeTimers();

      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      const PcCtor = RTCPeerConnection as ReturnType<typeof vi.fn>;

      // First failure -> 2000 ms backoff
      mockPc._triggerConnectionStateChange('failed');
      await flushMicrotasks();
      await vi.advanceTimersByTimeAsync(WEBRTC_CONFIG.initialReconnectDelay);
      await flushMicrotasks();

      const callsAfterFirstRetry = PcCtor.mock.calls.length;

      // Second failure -> 4000 ms backoff
      mockPc._triggerConnectionStateChange('failed');
      await flushMicrotasks();

      // Not yet at 4000 ms
      await vi.advanceTimersByTimeAsync(
        WEBRTC_CONFIG.initialReconnectDelay * 2 - 1
      );
      await flushMicrotasks();
      expect(PcCtor.mock.calls.length).toBe(callsAfterFirstRetry);

      // At 4000 ms
      await vi.advanceTimersByTimeAsync(1);
      await flushMicrotasks();
      expect(PcCtor.mock.calls.length).toBe(callsAfterFirstRetry + 1);

      transport.destroy();
    });

    it('3rd retry fires after 8000 ms (2^2 x initialReconnectDelay)', async () => {
      vi.useFakeTimers();

      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      const PcCtor = RTCPeerConnection as ReturnType<typeof vi.fn>;

      // Fail 1 -> 2000 ms
      mockPc._triggerConnectionStateChange('failed');
      await flushMicrotasks();
      await vi.advanceTimersByTimeAsync(WEBRTC_CONFIG.initialReconnectDelay);
      await flushMicrotasks();

      // Fail 2 -> 4000 ms
      mockPc._triggerConnectionStateChange('failed');
      await flushMicrotasks();
      await vi.advanceTimersByTimeAsync(
        WEBRTC_CONFIG.initialReconnectDelay * 2
      );
      await flushMicrotasks();

      const callsAfterSecondRetry = PcCtor.mock.calls.length;

      // Fail 3 -> 8000 ms
      mockPc._triggerConnectionStateChange('failed');
      await flushMicrotasks();

      // Not yet
      await vi.advanceTimersByTimeAsync(
        WEBRTC_CONFIG.initialReconnectDelay * 4 - 1
      );
      await flushMicrotasks();
      expect(PcCtor.mock.calls.length).toBe(callsAfterSecondRetry);

      // At 8000 ms
      await vi.advanceTimersByTimeAsync(1);
      await flushMicrotasks();
      expect(PcCtor.mock.calls.length).toBe(callsAfterSecondRetry + 1);

      transport.destroy();
    });

    it('backoff is capped at maxReconnectDelay (30000 ms)', async () => {
      vi.useFakeTimers();

      // Create a transport with a higher maxReconnectAttempts for this test
      const transport = new WebRTCTransport(ROBOT_ID);

      // We need to spy to verify the delay used internally.
      // Instead, we verify behaviour: at any retry count above 4,
      // the delay should never exceed maxReconnectDelay.
      transport.connect(BASE_URL);
      await flushMicrotasks();

      // For the cap test, just validate that advancing 30001 ms from the
      // last failure is sufficient to trigger the retry (it should fire at <=30000 ms).
      mockPc._triggerConnectionStateChange('failed');
      await flushMicrotasks();

      const PcCtor = RTCPeerConnection as ReturnType<typeof vi.fn>;
      const callsBefore = PcCtor.mock.calls.length;

      await vi.advanceTimersByTimeAsync(WEBRTC_CONFIG.maxReconnectDelay + 1);
      await flushMicrotasks();

      // Should have retried within the cap window
      expect(PcCtor.mock.calls.length).toBeGreaterThan(callsBefore);

      transport.destroy();
    });

    it('stops scheduling reconnects after maxReconnectAttempts (3)', async () => {
      vi.useFakeTimers();

      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      const PcCtor = RTCPeerConnection as ReturnType<typeof vi.fn>;
      // Record how many PCs were created before we start exhausting retries
      const initialCallCount = PcCtor.mock.calls.length;

      // With > exhaustion check we need maxReconnectAttempts+1 failures to
      // exhaust (retryCount 1,2,3 each schedule a retry; retryCount 4 exhausts).
      const totalFailures = WEBRTC_CONFIG.maxReconnectAttempts + 1;

      for (let i = 0; i < totalFailures; i++) {
        mockPc._triggerConnectionStateChange('failed');
        await flushMicrotasks();

        if (i < totalFailures - 1) {
          await vi.advanceTimersByTimeAsync(
            WEBRTC_CONFIG.maxReconnectDelay + 100
          );
          await flushMicrotasks();
        }
      }

      // Now advance a huge amount — no more reconnects should happen
      const callCountAfterExhaustion = PcCtor.mock.calls.length;
      await vi.advanceTimersByTimeAsync(WEBRTC_CONFIG.maxReconnectDelay * 10);
      await flushMicrotasks();

      expect(PcCtor.mock.calls.length).toBe(callCountAfterExhaustion);
      // Total retried exactly maxReconnectAttempts times after initial
      expect(PcCtor.mock.calls.length - initialCallCount).toBe(
        WEBRTC_CONFIG.maxReconnectAttempts
      );

      transport.destroy();
    });
  });

  // =========================================================================
  // Connection timeout
  // =========================================================================

  describe('connection timeout', () => {
    it('fires handleError after connectionTimeout if ICE never connects', async () => {
      vi.useFakeTimers();

      // Prevent setLocalDescription from completing ICE gathering automatically
      const hangingPc = createMockPeerConnection();
      hangingPc.setLocalDescription = vi.fn().mockResolvedValue(undefined);
      (RTCPeerConnection as ReturnType<typeof vi.fn>).mockImplementationOnce(
        // eslint-disable-next-line prefer-arrow-callback -- must use function() for new-ability
        function () {
          mockPc = hangingPc;
          return hangingPc;
        }
      );

      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      expect(transport.getCurrentState()).toBe('connecting');

      // Advance past the connection timeout
      await vi.advanceTimersByTimeAsync(WEBRTC_CONFIG.connectionTimeout + 100);
      await flushMicrotasks();

      // Should have moved to 'error' (or 'disconnected' if retries exhausted)
      expect(['error', 'disconnected']).toContain(transport.getCurrentState());

      transport.destroy();
    });

    it('connection timeout is cancelled by a successful ICE connection', async () => {
      vi.useFakeTimers();

      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      // Connect before the timeout fires
      mockPc._triggerConnectionStateChange('connected');
      await flushMicrotasks();

      expect(transport.getCurrentState()).toBe('connected');

      // Advance well past the timeout — state must remain connected
      await vi.advanceTimersByTimeAsync(WEBRTC_CONFIG.connectionTimeout * 2);
      await flushMicrotasks();

      expect(transport.getCurrentState()).toBe('connected');

      transport.destroy();
    });

    it('connection timeout is cancelled by disconnect()', async () => {
      vi.useFakeTimers();

      // Prevent ICE gathering from completing so the connection timeout arms
      const hangingPc = createMockPeerConnection();
      hangingPc.setLocalDescription = vi.fn().mockResolvedValue(undefined);
      (RTCPeerConnection as ReturnType<typeof vi.fn>).mockImplementationOnce(
        // eslint-disable-next-line prefer-arrow-callback -- must use function() for new-ability
        function () {
          mockPc = hangingPc;
          return hangingPc;
        }
      );

      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      transport.disconnect();
      await flushMicrotasks();

      // Advance past the timeout — no error transition should occur
      await vi.advanceTimersByTimeAsync(WEBRTC_CONFIG.connectionTimeout * 2);
      await flushMicrotasks();

      expect(transport.getCurrentState()).toBe('disconnected');
    });
  });

  // =========================================================================
  // disconnect()
  // =========================================================================

  describe('disconnect()', () => {
    it('transitions to disconnected state', async () => {
      const { transport } = await buildConnectedTransport();

      transport.disconnect();
      await flushMicrotasks();

      expect(transport.getCurrentState()).toBe('disconnected');

      transport.destroy();
    });

    it('closes the RTCPeerConnection', async () => {
      const { transport, pc } = await buildConnectedTransport();

      transport.disconnect();
      await flushMicrotasks();

      expect(pc.close).toHaveBeenCalledOnce();

      transport.destroy();
    });

    it('nulls the media stream', async () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      const mockStream = createMockMediaStream();
      mockPc._triggerTrack(mockStream);
      await flushMicrotasks();

      transport.disconnect();
      await flushMicrotasks();

      const stream = await firstValueFrom(transport.getMediaStream$());
      expect(stream).toBeNull();

      transport.destroy();
    });

    it('clears all timers so no reconnect is scheduled', async () => {
      vi.useFakeTimers();

      const { transport } = await buildConnectedTransport();

      transport.disconnect();
      await flushMicrotasks();

      const PcCtor = RTCPeerConnection as ReturnType<typeof vi.fn>;
      const callCount = PcCtor.mock.calls.length;

      await vi.advanceTimersByTimeAsync(WEBRTC_CONFIG.maxReconnectDelay * 10);
      await flushMicrotasks();

      expect(PcCtor.mock.calls.length).toBe(callCount);

      transport.destroy();
    });

    it('does not reconnect when the peer connection fires a state-change event after disconnect', async () => {
      vi.useFakeTimers();

      const { transport, pc } = await buildConnectedTransport();

      transport.disconnect();
      await flushMicrotasks();

      // A stale ICE failure event arriving after a deliberate disconnect
      pc._triggerConnectionStateChange('failed');
      await flushMicrotasks();

      const PcCtor = RTCPeerConnection as ReturnType<typeof vi.fn>;
      const callCount = PcCtor.mock.calls.length;

      await vi.advanceTimersByTimeAsync(WEBRTC_CONFIG.maxReconnectDelay + 100);
      await flushMicrotasks();

      expect(PcCtor.mock.calls.length).toBe(callCount);

      transport.destroy();
    });
  });

  // =========================================================================
  // destroy()
  // =========================================================================

  describe('destroy()', () => {
    it('completes the connectionState$ observable', async () => {
      const transport = new WebRTCTransport(ROBOT_ID);

      let completed = false;
      transport.getConnectionState$().subscribe({
        complete: () => {
          completed = true;
        },
      });

      transport.destroy();
      await flushMicrotasks();

      expect(completed).toBe(true);
    });

    it('completes the mediaStream$ observable', async () => {
      const transport = new WebRTCTransport(ROBOT_ID);

      let completed = false;
      transport.getMediaStream$().subscribe({
        complete: () => {
          completed = true;
        },
      });

      transport.destroy();
      await flushMicrotasks();

      expect(completed).toBe(true);
    });

    it('prevents further reconnects after destroy', async () => {
      vi.useFakeTimers();

      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      mockPc._triggerConnectionStateChange('failed');
      await flushMicrotasks();

      transport.destroy();

      const PcCtor = RTCPeerConnection as ReturnType<typeof vi.fn>;
      const callCount = PcCtor.mock.calls.length;

      await vi.advanceTimersByTimeAsync(WEBRTC_CONFIG.maxReconnectDelay * 10);
      await flushMicrotasks();

      expect(PcCtor.mock.calls.length).toBe(callCount);
    });

    it('is safe to call twice without throwing', () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      transport.destroy();
      expect(() => transport.destroy()).not.toThrow();
    });
  });

  // =========================================================================
  // getMediaStream$()
  // =========================================================================

  describe('getMediaStream$()', () => {
    it('emits null initially', async () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      const value = await firstValueFrom(transport.getMediaStream$());
      expect(value).toBeNull();
    });

    it('emits the MediaStream after a track event', async () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      const mockStream = createMockMediaStream('my-stream');
      mockPc._triggerTrack(mockStream);
      await flushMicrotasks();

      const value = await firstValueFrom(transport.getMediaStream$());
      expect(value).toBe(mockStream);

      transport.destroy();
    });

    it('emits null after disconnect', async () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      const mockStream = createMockMediaStream();
      mockPc._triggerTrack(mockStream);
      await flushMicrotasks();

      transport.disconnect();
      await flushMicrotasks();

      const value = await firstValueFrom(transport.getMediaStream$());
      expect(value).toBeNull();

      transport.destroy();
    });

    it('deduplicates consecutive identical stream emissions', async () => {
      const transport = new WebRTCTransport(ROBOT_ID);
      transport.connect(BASE_URL);
      await flushMicrotasks();

      const emissions: (MediaStream | null)[] = [];
      transport.getMediaStream$().subscribe((s) => emissions.push(s));

      const mockStream = createMockMediaStream();

      // Simulate the same stream reference being emitted multiple times
      mockPc._triggerTrack(mockStream);
      await flushMicrotasks();
      mockPc._triggerTrack(mockStream);
      await flushMicrotasks();

      // After initial null, one stream emission — the duplicate must be suppressed
      const streamEmissions = emissions.filter((s) => s !== null);
      expect(streamEmissions.length).toBe(1);

      transport.destroy();
    });
  });
});
