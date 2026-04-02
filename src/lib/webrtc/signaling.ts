interface OfferResponse {
  readonly sdp: string;
  readonly type: RTCSdpType;
}

export class SignalingClient {
  private readonly url: string;

  constructor(url: string) {
    this.url = url.replace(/^ws(s)?:\/\//, 'http$1://');
  }

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
