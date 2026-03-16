import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';

import { SignalingClient } from './SignalingClient';

import { WEBRTC_CONFIG, WEBRTC_PATH } from '@/config/webrtc';
import { SignalingError } from '@/features/webrtc/webrtc.types';

// ---------------------------------------------------------------------------
// Global fetch mock
// ---------------------------------------------------------------------------

vi.stubGlobal('fetch', vi.fn());

const BASE_URL = 'http://robot.local:8080';
const OFFER_URL = `${BASE_URL}${WEBRTC_PATH}/offer`;

const MOCK_OFFER = {
  sdp: 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\n',
  type: 'offer' as RTCSdpType,
  video: true,
  audio: false,
};

const MOCK_ANSWER = {
  sdp: 'v=0\r\no=- 1 1 IN IP4 127.0.0.1\r\n',
  type: 'answer' as RTCSdpType,
};

function makeFetchResponse(body: unknown, status = 200, ok = true): Response {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(JSON.stringify(body)),
  } as unknown as Response;
}

// ---------------------------------------------------------------------------
// Helper: get the typed fetch mock
// ---------------------------------------------------------------------------

function getMockFetch() {
  return fetch as unknown as Mock<typeof fetch>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SignalingClient', () => {
  let client: SignalingClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new SignalingClient(BASE_URL);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // -------------------------------------------------------------------------
  // Constructor validation
  // -------------------------------------------------------------------------

  describe('constructor', () => {
    it('accepts http URLs', () => {
      expect(() => new SignalingClient('http://robot.local')).not.toThrow();
    });

    it('accepts https URLs', () => {
      expect(() => new SignalingClient('https://robot.local')).not.toThrow();
    });

    it('throws on non-http/https URL', () => {
      expect(() => new SignalingClient('ws://robot.local')).toThrow(
        SignalingError
      );
    });

    it('throws with code SIGNALING_INVALID_URL on bad URL', () => {
      try {
        new SignalingClient('ws://robot.local');
        expect.fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(SignalingError);
        expect((err as SignalingError).code).toBe('SIGNALING_INVALID_URL');
      }
    });
  });

  // -------------------------------------------------------------------------
  // Request shape
  // -------------------------------------------------------------------------

  describe('sendOffer — request shape', () => {
    it('POSTs to {baseUrl}{WEBRTC_PATH}/offer', async () => {
      getMockFetch().mockResolvedValueOnce(makeFetchResponse(MOCK_ANSWER));

      await client.sendOffer(MOCK_OFFER);

      expect(getMockFetch()).toHaveBeenCalledOnce();
      const [url] = getMockFetch().mock.calls[0] as [string, RequestInit];
      expect(url).toBe(OFFER_URL);
    });

    it('uses POST method', async () => {
      getMockFetch().mockResolvedValueOnce(makeFetchResponse(MOCK_ANSWER));

      await client.sendOffer(MOCK_OFFER);

      const [, init] = getMockFetch().mock.calls[0] as [string, RequestInit];
      expect(init.method).toBe('POST');
    });

    it('sets Content-Type: application/json header', async () => {
      getMockFetch().mockResolvedValueOnce(makeFetchResponse(MOCK_ANSWER));

      await client.sendOffer(MOCK_OFFER);

      const [, init] = getMockFetch().mock.calls[0] as [string, RequestInit];
      const headers = init.headers as Record<string, string>;
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('serialises the offer as JSON in the request body', async () => {
      getMockFetch().mockResolvedValueOnce(makeFetchResponse(MOCK_ANSWER));

      await client.sendOffer(MOCK_OFFER);

      const [, init] = getMockFetch().mock.calls[0] as [string, RequestInit];
      expect(JSON.parse(init.body as string)).toEqual(MOCK_OFFER);
    });
  });

  // -------------------------------------------------------------------------
  // Success path
  // -------------------------------------------------------------------------

  describe('sendOffer — success', () => {
    it('returns the parsed SdpAnswer on a 200 response', async () => {
      getMockFetch().mockResolvedValueOnce(makeFetchResponse(MOCK_ANSWER));

      const answer = await client.sendOffer(MOCK_OFFER);

      expect(answer).toEqual(MOCK_ANSWER);
    });
  });

  // -------------------------------------------------------------------------
  // HTTP error path
  // -------------------------------------------------------------------------

  describe('sendOffer — HTTP error', () => {
    it('throws SignalingError with code SIGNALING_HTTP_ERROR on non-ok response', async () => {
      getMockFetch().mockResolvedValueOnce(
        makeFetchResponse({ error: 'Bad Request' }, 400, false)
      );

      await expect(client.sendOffer(MOCK_OFFER)).rejects.toThrow(
        SignalingError
      );
    });

    it('includes the HTTP statusCode on the thrown error', async () => {
      getMockFetch().mockResolvedValueOnce(
        makeFetchResponse({ error: 'Internal Server Error' }, 500, false)
      );

      try {
        await client.sendOffer(MOCK_OFFER);
        expect.fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(SignalingError);
        const sigErr = err as SignalingError;
        expect(sigErr.code).toBe('SIGNALING_HTTP_ERROR');
        expect(sigErr.statusCode).toBe(500);
      }
    });

    it('propagates statusCode 400', async () => {
      getMockFetch().mockResolvedValueOnce(
        makeFetchResponse({ error: 'Bad Request' }, 400, false)
      );

      try {
        await client.sendOffer(MOCK_OFFER);
        expect.fail('should have thrown');
      } catch (err) {
        expect((err as SignalingError).statusCode).toBe(400);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Timeout path
  // -------------------------------------------------------------------------

  describe('sendOffer — connection timeout', () => {
    it('aborts the fetch after connectionTimeout ms', async () => {
      vi.useFakeTimers();

      // fetch never resolves until the abort signal fires
      getMockFetch().mockImplementationOnce(
        (_url: string, init: RequestInit): Promise<Response> =>
          new Promise((_resolve, reject) => {
            init.signal!.addEventListener('abort', () => {
              reject(
                new DOMException('The operation was aborted.', 'AbortError')
              );
            });
          })
      );

      // Attach a no-op catch so the Promise is never "unhandled" from vitest's
      // perspective — the real assertion is on the settled value below.
      const promise = client.sendOffer(MOCK_OFFER).catch((e: unknown) => e);

      // Advance past the timeout
      await vi.advanceTimersByTimeAsync(WEBRTC_CONFIG.connectionTimeout + 1);

      const result = await promise;
      expect(result).toBeInstanceOf(SignalingError);
    });

    it('throws SignalingError with code SIGNALING_TIMEOUT when the AbortController fires', async () => {
      vi.useFakeTimers();

      getMockFetch().mockImplementationOnce(
        (_url: string, init: RequestInit): Promise<Response> =>
          new Promise((_resolve, reject) => {
            init.signal!.addEventListener('abort', () => {
              reject(
                new DOMException('The operation was aborted.', 'AbortError')
              );
            });
          })
      );

      const promise = client.sendOffer(MOCK_OFFER).catch((e: unknown) => e);

      await vi.advanceTimersByTimeAsync(WEBRTC_CONFIG.connectionTimeout + 1);

      const result = await promise;
      expect(result).toBeInstanceOf(SignalingError);
      expect((result as SignalingError).code).toBe('SIGNALING_TIMEOUT');
    });

    it('does NOT fire before the timeout elapses', async () => {
      vi.useFakeTimers();

      let fetchSettled = false;

      getMockFetch().mockImplementationOnce((): Promise<Response> => {
        return new Promise((resolve) => {
          // resolve slightly after the connectionTimeout
          setTimeout(() => {
            fetchSettled = true;
            resolve(makeFetchResponse(MOCK_ANSWER));
          }, WEBRTC_CONFIG.connectionTimeout + 5000);
        });
      });

      const promise = client.sendOffer(MOCK_OFFER).catch(() => null);

      // Advance to just before the timeout — fetch should not have settled yet
      await vi.advanceTimersByTimeAsync(WEBRTC_CONFIG.connectionTimeout - 1);

      expect(fetchSettled).toBe(false);

      // Advance past both the timeout and the fetch resolution
      await vi.advanceTimersByTimeAsync(WEBRTC_CONFIG.connectionTimeout + 6000);
      await promise;
    });
  });

  // -------------------------------------------------------------------------
  // Network error path
  // -------------------------------------------------------------------------

  describe('sendOffer — network failure', () => {
    it('throws SignalingError with code SIGNALING_NETWORK_ERROR when fetch rejects with a non-abort error', async () => {
      getMockFetch().mockRejectedValueOnce(new TypeError('Failed to fetch'));

      try {
        await client.sendOffer(MOCK_OFFER);
        expect.fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(SignalingError);
        expect((err as SignalingError).code).toBe('SIGNALING_NETWORK_ERROR');
      }
    });

    it('preserves the original error message in the SignalingError message', async () => {
      getMockFetch().mockRejectedValueOnce(
        new TypeError('net::ERR_CONNECTION_REFUSED')
      );

      try {
        await client.sendOffer(MOCK_OFFER);
        expect.fail('should have thrown');
      } catch (err) {
        expect((err as SignalingError).message).toContain(
          'net::ERR_CONNECTION_REFUSED'
        );
      }
    });
  });

  // -------------------------------------------------------------------------
  // Timer cleanup
  // -------------------------------------------------------------------------

  describe('sendOffer — abort timer cleanup', () => {
    it('clears the abort timer after a successful response so it does not fire later', async () => {
      vi.useFakeTimers();

      getMockFetch().mockResolvedValueOnce(makeFetchResponse(MOCK_ANSWER));

      await client.sendOffer(MOCK_OFFER);

      // Advance well past the connection timeout — no errors should surface
      await expect(
        vi.advanceTimersByTimeAsync(WEBRTC_CONFIG.connectionTimeout * 2)
      ).resolves.not.toThrow();
    });

    it('clears the abort timer after an HTTP error response', async () => {
      vi.useFakeTimers();

      getMockFetch().mockResolvedValueOnce(
        makeFetchResponse({ error: 'Not Found' }, 404, false)
      );

      await expect(client.sendOffer(MOCK_OFFER)).rejects.toBeInstanceOf(
        SignalingError
      );

      // Timer must already be cleared — advancing should not throw anything new
      await expect(
        vi.advanceTimersByTimeAsync(WEBRTC_CONFIG.connectionTimeout * 2)
      ).resolves.not.toThrow();
    });
  });
});
