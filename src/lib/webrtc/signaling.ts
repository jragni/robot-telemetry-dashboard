import { z } from 'zod';

/** offerResponseSchema
 * @description Zod schema validating the SDP answer returned by the WebRTC signaling endpoint.
 */
export const offerResponseSchema = z.object({
  sdp: z.string(),
  type: z.enum(['offer', 'answer', 'pranswer', 'rollback']),
});

/** SignalingClient
 * @description HTTP-based WebRTC signaling client. Sends SDP offers to the robot's
 *  aiortc endpoint and returns the SDP answer for peer connection setup.
 */
export class SignalingClient {
  private readonly url: string;

  constructor(url: string) {
    this.url = url.replace(/^ws(s)?:\/\//, 'http$1://');
  }

  /** @description Posts an SDP offer to the signaling endpoint and returns the parsed answer. */
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

    try {
      const raw: unknown = await response.json();
      const result = offerResponseSchema.safeParse(raw);
      if (!result.success) {
        throw new Error(`Signaling response malformed: ${JSON.stringify(result.error.issues)}`);
      }
      return { sdp: result.data.sdp, type: result.data.type };
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Signaling')) throw err;
      throw new Error(`Signaling response parsing failed: ${String(err)}`);
    }
  }
}
