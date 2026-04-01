/** SignalingClient
 * @description REST-based signaling client for aiortc WebRTC servers. Sends an
 *  SDP offer via HTTP POST and receives the server's SDP answer. Converts
 *  WebSocket-scheme URLs to HTTP since aiortc uses REST, not WebSocket,
 *  for signaling.
 */

interface OfferResponse {
  readonly sdp: string;
  readonly type: RTCSdpType;
}

export class SignalingClient {
  private readonly url: string;

  constructor(url: string) {
    this.url = url.replace(/^ws(s)?:\/\//, 'http$1://');
  }

  /** sendOffer
   * @description Posts an SDP offer to the signaling server and returns the
   *  server's SDP answer. Appends `/offer` to the URL if not already present.
   * @param offer - The local SDP offer to send.
   * @returns The remote SDP answer from the server.
   */
  async sendOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    const endpoint = this.url.endsWith('/offer') ? this.url : `${this.url}/offer`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sdp: offer.sdp, type: offer.type }),
    });

    if (!response.ok) {
      throw new Error(`Signaling failed: HTTP ${String(response.status)} ${response.statusText}`);
    }

    const data = (await response.json()) as OfferResponse;
    return { type: data.type, sdp: data.sdp };
  }
}
