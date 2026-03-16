import { BehaviorSubject, type Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { SignalingClient } from '../signaling/SignalingClient';

import { DEFAULT_ICE_SERVERS, WEBRTC_CONFIG } from '@/config/webrtc';
import { createLogger } from '@/lib/logger';
import { useWebRTCStore } from '@/stores/webrtc/webrtc.store';
import type {
  ConnectionError,
  ConnectionState,
} from '@/types/connection.types';

const log = createLogger('WebRTCTransport');

// ---------------------------------------------------------------------------
// WebRTCTransport
// ---------------------------------------------------------------------------

/**
 * Manages a single WebRTC peer connection for a given robot.
 *
 * Mirrors the {@link RosTransport} lifecycle pattern with the following
 * additions:
 * - A second {@link BehaviorSubject} tracks the received {@link MediaStream}.
 * - SDP negotiation (offer → ICE gathering → signaling → remote description)
 *   is handled internally via {@link SignalingClient}.
 * - Exponential backoff: `delay = min(initialReconnectDelay * 2^(retryCount-1), maxReconnectDelay)`.
 * - A connection timeout timer fires {@link handleIceFailure} if ICE never
 *   reaches a connected state within {@link WEBRTC_CONFIG.connectionTimeout} ms.
 * - A generation counter prevents stale async callbacks from a previous
 *   connection attempt from interfering with a newer one.
 */
export class WebRTCTransport {
  // -------------------------------------------------------------------------
  // Fields
  // -------------------------------------------------------------------------

  private readonly robotId: string;

  private readonly connectionState$$ = new BehaviorSubject<ConnectionState>(
    'disconnected'
  );
  private readonly mediaStream$$ = new BehaviorSubject<MediaStream | null>(
    null
  );

  /** Incremented each time a new peer connection is created.  Async callbacks
   *  capture their generation at creation time and bail out if it has changed. */
  private generation = 0;

  private peerConnection: RTCPeerConnection | null = null;
  private signalingClient: SignalingClient | null = null;

  private retryCount = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private connectionTimeoutTimer: ReturnType<typeof setTimeout> | null = null;

  private destroyed = false;

  /** The base URL of the currently targeted robot.  Set to null on deliberate
   *  disconnects so that stale ICE-failure callbacks skip reconnect scheduling. */
  private currentBaseUrl: string | null = null;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor(robotId: string) {
    this.robotId = robotId;
    log.debug(`WebRTCTransport created for robot "${robotId}"`);
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Establish a WebRTC peer connection to the given base URL.
   *
   * Resets `retryCount` and any pending timers, then creates a new
   * {@link RTCPeerConnection} and starts SDP negotiation.
   *
   * Safe to call while already connected — the previous connection is torn
   * down first.
   */
  connect(baseUrl: string): void {
    if (this.destroyed) {
      log.warn('connect() called on a destroyed WebRTCTransport — ignoring');
      return;
    }

    log.info(
      `Connecting robot "${this.robotId}" to ${baseUrl} (attempt ${this.retryCount + 1})`
    );

    this.currentBaseUrl = baseUrl;
    this.retryCount = 0;
    this.clearAllTimers();
    this.closePeerConnection();

    this.createConnection(baseUrl);
  }

  /**
   * Deliberately close the peer connection.  No reconnect will be scheduled.
   */
  disconnect(): void {
    log.info(`Disconnecting robot "${this.robotId}"`);

    // Nulling currentBaseUrl signals to stale callbacks that this was
    // a deliberate close — they must not schedule a reconnect.
    this.currentBaseUrl = null;
    this.clearAllTimers();
    this.closePeerConnection();
    this.mediaStream$$.next(null);
    this.setState('disconnected');
  }

  /**
   * Permanently shut down the transport.  Completes all observables and
   * prevents any future activity.  Safe to call multiple times.
   */
  destroy(): void {
    if (this.destroyed) return;

    log.info(`Destroying WebRTCTransport for robot "${this.robotId}"`);

    this.destroyed = true;
    this.currentBaseUrl = null;
    this.clearAllTimers();
    this.closePeerConnection();
    this.mediaStream$$.next(null);
    this.setState('disconnected');
    this.connectionState$$.complete();
    this.mediaStream$$.complete();
  }

  /** Observable of the current connection state (deduplicated). */
  getConnectionState$(): Observable<ConnectionState> {
    return this.connectionState$$.pipe(distinctUntilChanged());
  }

  /** Observable of the current {@link MediaStream} (null when none, deduplicated). */
  getMediaStream$(): Observable<MediaStream | null> {
    return this.mediaStream$$.pipe(distinctUntilChanged());
  }

  /** Synchronous snapshot of the current connection state. */
  getCurrentState(): ConnectionState {
    return this.connectionState$$.getValue();
  }

  // -------------------------------------------------------------------------
  // Private — connection setup
  // -------------------------------------------------------------------------

  private createConnection(baseUrl: string): void {
    this.generation += 1;
    const capturedGeneration = this.generation;

    log.info(
      `Creating RTCPeerConnection for robot "${this.robotId}" (gen=${capturedGeneration})`
    );

    this.peerConnection = new RTCPeerConnection({
      iceServers: DEFAULT_ICE_SERVERS,
    });

    this.signalingClient = new SignalingClient(baseUrl);

    this.attachPeerConnectionHandlers(capturedGeneration);
    this.setState('connecting');
    this.armConnectionTimeout(capturedGeneration);

    // Kick off the offer/answer exchange asynchronously.
    void this.initiateOffer(capturedGeneration);
  }

  private attachPeerConnectionHandlers(generation: number): void {
    if (!this.peerConnection) return;

    this.peerConnection.onconnectionstatechange = () => {
      if (generation !== this.generation) return;
      this.handleConnectionStateChange();
    };

    this.peerConnection.ontrack = (event: RTCTrackEvent) => {
      if (generation !== this.generation) return;
      const stream = event.streams[0] ?? null;
      if (stream) {
        log.info(`Robot "${this.robotId}" received media track`);
        this.mediaStream$$.next(stream);
      }
    };
  }

  // -------------------------------------------------------------------------
  // Private — SDP negotiation
  // -------------------------------------------------------------------------

  private async initiateOffer(generation: number): Promise<void> {
    if (!this.peerConnection || !this.signalingClient) return;

    try {
      log.debug(`Robot "${this.robotId}" creating SDP offer`);

      const offerDesc = await this.peerConnection.createOffer();

      if (generation !== this.generation) return;

      await this.peerConnection.setLocalDescription(offerDesc);

      if (generation !== this.generation) return;

      // Wait for ICE gathering to complete
      await this.waitForIceGathering(generation);

      if (generation !== this.generation) return;

      const localDesc = this.peerConnection.localDescription;
      if (!localDesc) {
        throw new Error('localDescription is null after ICE gathering');
      }

      log.debug(
        `Robot "${this.robotId}" sending SDP offer to signaling server`
      );

      const answer = await this.signalingClient.sendOffer({
        sdp: localDesc.sdp,
        type: localDesc.type,
        video: true,
        audio: false,
      });

      if (generation !== this.generation) return;

      await this.peerConnection.setRemoteDescription(answer);

      log.debug(
        `Robot "${this.robotId}" SDP exchange complete — waiting for ICE`
      );
    } catch (err) {
      if (generation !== this.generation) return;

      log.error(
        `Robot "${this.robotId}" SDP negotiation failed: ${err instanceof Error ? err.message : String(err)}`
      );

      this.handleIceFailure();
    }
  }

  /**
   * Returns a Promise that resolves once `iceGatheringState === 'complete'`.
   * If gathering is already complete this resolves immediately.
   */
  private waitForIceGathering(generation: number): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!this.peerConnection) {
        resolve();
        return;
      }

      if (this.peerConnection.iceGatheringState === 'complete') {
        resolve();
        return;
      }

      const handler = () => {
        if (generation !== this.generation) {
          resolve();
          return;
        }
        if (this.peerConnection?.iceGatheringState === 'complete') {
          resolve();
        }
      };

      this.peerConnection.onicegatheringstatechange = handler;
    });
  }

  // -------------------------------------------------------------------------
  // Private — ICE / connection state
  // -------------------------------------------------------------------------

  private handleConnectionStateChange(): void {
    const state = this.peerConnection?.connectionState;

    log.debug(
      `Robot "${this.robotId}" ICE connection state changed to "${state ?? 'unknown'}"`
    );

    if (state === 'connected' || state === 'completed') {
      this.handleConnected();
    } else if (state === 'failed') {
      this.handleIceFailure();
    }
    // 'disconnected' and 'closed' are informational — we let the timeout
    // or explicit disconnect handle them.
  }

  private handleConnected(): void {
    log.info(`Robot "${this.robotId}" WebRTC connected`);

    this.clearAllTimers();
    this.retryCount = 0;
    this.setState('connected', null);
  }

  private handleIceFailure(): void {
    this.mediaStream$$.next(null);
    this.retryCount += 1;

    const exhausted = this.retryCount > WEBRTC_CONFIG.maxReconnectAttempts;

    const connectionError: ConnectionError = {
      message: `WebRTC ICE failure (attempt ${this.retryCount}/${WEBRTC_CONFIG.maxReconnectAttempts})`,
      code: 'WEBRTC_ICE_FAILED',
      timestamp: Date.now(),
    };

    if (exhausted) {
      log.warn(
        `Robot "${this.robotId}" exhausted ${WEBRTC_CONFIG.maxReconnectAttempts} reconnect attempts`
      );
      this.setState('disconnected', connectionError);
    } else {
      log.warn(
        `Robot "${this.robotId}" ICE failed — scheduling retry ${this.retryCount}/${WEBRTC_CONFIG.maxReconnectAttempts}`
      );
      this.setState('error', connectionError);
      this.scheduleReconnect();
    }
  }

  // -------------------------------------------------------------------------
  // Private — reconnect scheduling
  // -------------------------------------------------------------------------

  private scheduleReconnect(): void {
    if (this.destroyed || !this.currentBaseUrl) return;

    // Exponential backoff: delay = min(initialDelay * 2^(retryCount-1), maxDelay)
    const delay = Math.min(
      WEBRTC_CONFIG.initialReconnectDelay * Math.pow(2, this.retryCount - 1),
      WEBRTC_CONFIG.maxReconnectDelay
    );

    log.info(
      `Scheduling reconnect attempt ${this.retryCount}/${WEBRTC_CONFIG.maxReconnectAttempts} ` +
        `for robot "${this.robotId}" in ${delay}ms`
    );

    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      if (this.destroyed || !this.currentBaseUrl) return;

      log.info(
        `Executing reconnect attempt ${this.retryCount}/${WEBRTC_CONFIG.maxReconnectAttempts} ` +
          `for robot "${this.robotId}"`
      );

      // Preserve retryCount — do NOT reset it the way connect() does.
      this.closePeerConnection();
      this.generation += 1;
      const capturedGeneration = this.generation;

      this.peerConnection = new RTCPeerConnection({
        iceServers: DEFAULT_ICE_SERVERS,
      });

      this.signalingClient = new SignalingClient(this.currentBaseUrl);

      this.attachPeerConnectionHandlers(capturedGeneration);
      this.setState('connecting');
      this.armConnectionTimeout(capturedGeneration);

      void this.initiateOffer(capturedGeneration);
    }, delay);
  }

  // -------------------------------------------------------------------------
  // Private — connection timeout
  // -------------------------------------------------------------------------

  private armConnectionTimeout(generation: number): void {
    this.connectionTimeoutTimer = setTimeout(() => {
      this.connectionTimeoutTimer = null;
      if (generation !== this.generation) return;
      if (this.destroyed || !this.currentBaseUrl) return;

      log.warn(
        `Robot "${this.robotId}" connection timed out after ${WEBRTC_CONFIG.connectionTimeout}ms`
      );

      this.handleIceFailure();
    }, WEBRTC_CONFIG.connectionTimeout);
  }

  // -------------------------------------------------------------------------
  // Private — cleanup
  // -------------------------------------------------------------------------

  private clearRetryTimer(): void {
    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  private clearConnectionTimeoutTimer(): void {
    if (this.connectionTimeoutTimer !== null) {
      clearTimeout(this.connectionTimeoutTimer);
      this.connectionTimeoutTimer = null;
    }
  }

  private clearAllTimers(): void {
    this.clearRetryTimer();
    this.clearConnectionTimeoutTimer();
  }

  /**
   * Null out all event handler properties, close the peer connection, and
   * release the reference.  Safe to call when `peerConnection` is already null.
   */
  private closePeerConnection(): void {
    if (!this.peerConnection) return;

    this.peerConnection.onconnectionstatechange = null;
    this.peerConnection.onicecandidate = null;
    this.peerConnection.ontrack = null;
    this.peerConnection.onsignalingstatechange = null;
    this.peerConnection.oniceconnectionstatechange = null;
    this.peerConnection.onicegatheringstatechange = null;

    try {
      this.peerConnection.close();
    } catch {
      // Closing an already-closed connection may throw in some environments
    }

    this.peerConnection = null;
    this.signalingClient = null;
  }

  // -------------------------------------------------------------------------
  // Private — state helpers
  // -------------------------------------------------------------------------

  /**
   * Write the new state to the local {@link BehaviorSubject} and mirror it
   * into the Zustand store.
   *
   * @param state  New connection state.
   * @param error  When provided (including explicit `null`), also updates the
   *               error entry in the store.  Omit to leave the existing error
   *               untouched.
   */
  private setState(
    state: ConnectionState,
    error?: ConnectionError | null
  ): void {
    this.connectionState$$.next(state);

    const store = useWebRTCStore.getState();
    store.setConnectionState(this.robotId, state);

    if (error !== undefined) {
      store.setConnectionError(this.robotId, error);
    }
  }
}
