/**
 * WebRTC Signaling Client
 *
 * Handles REST-based communication with aiortc signaling server
 */

type EventListener<T = unknown> = (data: T) => void;

interface SignalingEvents {
  connected: () => void;
  disconnected: () => void;
  error: (error: Error) => void;
}

interface OfferResponse {
  sdp: string;
  type: RTCSdpType;
}

export class SignalingClient {
  private url: string;
  private eventListeners = new Map<keyof SignalingEvents, Set<EventListener>>();
  private isConnected = false;

  constructor(url: string) {
    // Convert ws:// or wss:// to http:// or https://
    this.url = url.replace(/^ws(s)?:\/\//, 'http$1://');
  }

  /**
   * Connect to signaling server (no-op for REST-based signaling)
   */
  async connect(): Promise<void> {
    // Prevent duplicate connections
    if (this.isConnected) {
      console.log('SignalingClient: Already connected, skipping');
      return;
    }

    // For REST-based signaling, we just test if the server is reachable
    try {
      await fetch(this.url.replace(/\/offer$/, ''), {
        method: 'HEAD',
        credentials: 'include', // Include cookies for localtunnel authentication
      }).catch(() => null);

      // Don't fail if HEAD request fails - server might not support it
      this.isConnected = true;
      console.log('SignalingClient: Connected');
      this.emit('connected');
    } catch {
      // Continue anyway - we'll catch connection errors on actual offer
      this.isConnected = true;
      console.log('SignalingClient: Connected (HEAD request not supported)');
      this.emit('connected');
    }
  }

  /**
   * Disconnect from signaling server (no-op for REST-based signaling)
   */
  disconnect(): void {
    if (!this.isConnected) {
      return;
    }
    console.log('SignalingClient: Disconnecting');
    this.isConnected = false;
    this.emit('disconnected');
  }

  /**
   * Send SDP offer and get answer from server
   */
  async sendOffer(
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> {
    try {
      const offerEndpoint = this.url.endsWith('/offer')
        ? this.url
        : `${this.url}/offer`;

      console.log('Sending offer to:', offerEndpoint);

      const response = await fetch(offerEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for localtunnel authentication
        body: JSON.stringify({
          sdp: offer.sdp,
          type: offer.type,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as OfferResponse;

      console.log('Received answer from server');

      return {
        type: data.type,
        sdp: data.sdp,
      };
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error('Failed to exchange SDP offer/answer');
      this.emit('error', err);
      throw err;
    }
  }

  /**
   * Add event listener
   */
  on<K extends keyof SignalingEvents>(
    event: K,
    listener: SignalingEvents[K]
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener as EventListener);
  }

  /**
   * Remove event listener
   */
  off<K extends keyof SignalingEvents>(
    event: K,
    listener: SignalingEvents[K]
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener as EventListener);
    }
  }

  /**
   * Emit event to all listeners
   */
  private emit<K extends keyof SignalingEvents>(
    event: K,
    ...args: Parameters<SignalingEvents[K]>
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          (
            listener as unknown as (
              ...eventArgs: Parameters<SignalingEvents[K]>
            ) => void
          )(...args);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Check if connected
   */
  isConnectedToServer(): boolean {
    return this.isConnected;
  }
}
