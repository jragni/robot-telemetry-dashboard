import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SignalingClient } from '../signaling';

const MOCK_OFFER: RTCSessionDescriptionInit = {
  sdp: 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\n',
  type: 'offer',
};

const VALID_ANSWER = {
  sdp: 'v=0\r\no=- 1 1 IN IP4 127.0.0.1\r\n',
  type: 'answer',
};

function mockFetchResponse(body: unknown, options: { ok?: boolean; status?: number; statusText?: string } = {}) {
  const { ok = true, status = 200, statusText = 'OK' } = options;
  return vi.fn().mockResolvedValue({
    json: () => Promise.resolve(body),
    ok,
    status,
    statusText,
  });
}

describe('SignalingClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetchResponse(VALID_ANSWER));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('URL conversion', () => {
    it('converts ws:// to http://', async () => {
      const client = new SignalingClient('ws://localhost:8080/webrtc');
      await client.sendOffer(MOCK_OFFER);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/webrtc/offer',
        expect.any(Object),
      );
    });

    it('converts wss:// to https://', async () => {
      const client = new SignalingClient('wss://robot.example.com/webrtc');
      await client.sendOffer(MOCK_OFFER);

      expect(fetch).toHaveBeenCalledWith(
        'https://robot.example.com/webrtc/offer',
        expect.any(Object),
      );
    });

    it('preserves http:// URLs unchanged', async () => {
      const client = new SignalingClient('http://localhost:8080/webrtc');
      await client.sendOffer(MOCK_OFFER);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/webrtc/offer',
        expect.any(Object),
      );
    });

    it('does not append /offer when URL already ends with /offer', async () => {
      const client = new SignalingClient('ws://localhost:8080/webrtc/offer');
      await client.sendOffer(MOCK_OFFER);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/webrtc/offer',
        expect.any(Object),
      );
    });
  });

  describe('successful offer', () => {
    it('returns parsed answer from valid response', async () => {
      const client = new SignalingClient('ws://localhost:8080/webrtc');
      const result = await client.sendOffer(MOCK_OFFER);

      expect(result).toEqual({ sdp: VALID_ANSWER.sdp, type: VALID_ANSWER.type });
    });
  });

  describe('fetch options', () => {
    it('sends POST with correct Content-Type and body', async () => {
      const client = new SignalingClient('ws://localhost:8080/webrtc');
      await client.sendOffer(MOCK_OFFER);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        {
          body: JSON.stringify({ sdp: MOCK_OFFER.sdp, type: MOCK_OFFER.type }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        },
      );
    });
  });

  describe('error handling', () => {
    it('throws on HTTP error response', async () => {
      vi.stubGlobal('fetch', mockFetchResponse(null, { ok: false, status: 502, statusText: 'Bad Gateway' }));

      const client = new SignalingClient('ws://localhost:8080/webrtc');

      await expect(client.sendOffer(MOCK_OFFER)).rejects.toThrow('Signaling failed: HTTP 502 Bad Gateway');
    });

    it('throws on malformed JSON response', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: () => Promise.reject(new SyntaxError('Unexpected token')),
        ok: true,
        status: 200,
        statusText: 'OK',
      }));

      const client = new SignalingClient('ws://localhost:8080/webrtc');

      await expect(client.sendOffer(MOCK_OFFER)).rejects.toThrow('Signaling response parsing failed');
    });

    it('throws on Zod validation failure for wrong shape', async () => {
      vi.stubGlobal('fetch', mockFetchResponse({ invalid: 'data' }));

      const client = new SignalingClient('ws://localhost:8080/webrtc');

      await expect(client.sendOffer(MOCK_OFFER)).rejects.toThrow('Signaling response malformed');
    });

    it('throws on Zod validation failure for missing sdp field', async () => {
      vi.stubGlobal('fetch', mockFetchResponse({ type: 'answer' }));

      const client = new SignalingClient('ws://localhost:8080/webrtc');

      await expect(client.sendOffer(MOCK_OFFER)).rejects.toThrow('Signaling response malformed');
    });
  });
});
