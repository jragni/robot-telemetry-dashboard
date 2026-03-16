import type { SdpAnswer, SdpOffer } from './SignalingClient.types';

import { WEBRTC_CONFIG, WEBRTC_PATH } from '@/config/webrtc';
import { SignalingError } from '@/features/webrtc/webrtc.types';
import { createLogger } from '@/lib/logger';

const log = createLogger('SignalingClient');

export type { SdpOffer, SdpAnswer } from './SignalingClient.types';

/**
 * Thin HTTP client responsible for the SDP offer/answer exchange with the
 * robot's signaling server endpoint.
 *
 * All failures are normalised into {@link SignalingError} instances so that
 * callers can handle them uniformly regardless of whether the failure was a
 * network error, an HTTP error, or a connection timeout.
 */
export class SignalingClient {
  private readonly baseUrl: string;

  /**
   * @param baseUrl  HTTP/HTTPS base URL of the robot (e.g. "http://robot.local:8080").
   *                 Must start with "http://" or "https://".
   * @throws {SignalingError} with code `SIGNALING_INVALID_URL` when the URL
   *                          scheme is not http or https.
   */
  constructor(baseUrl: string) {
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      throw new SignalingError(
        `SignalingClient: baseUrl must start with http:// or https://, got "${baseUrl}"`,
        'SIGNALING_INVALID_URL'
      );
    }

    this.baseUrl = baseUrl;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * POST an SDP offer to `{baseUrl}{WEBRTC_PATH}/offer` and return the parsed
   * {@link SdpAnswer}.
   *
   * An {@link AbortController} is armed for {@link WEBRTC_CONFIG.connectionTimeout}
   * milliseconds.  The timer is always cleared in `finally` so a resolved
   * response never leaves a dangling timer.
   *
   * @throws {SignalingError} code `SIGNALING_TIMEOUT`       – fetch aborted due to timeout
   * @throws {SignalingError} code `SIGNALING_HTTP_ERROR`    – server returned a non-2xx status
   * @throws {SignalingError} code `SIGNALING_NETWORK_ERROR` – fetch rejected (e.g. no network)
   */
  async sendOffer(offer: SdpOffer): Promise<SdpAnswer> {
    const url = `${this.baseUrl}${WEBRTC_PATH}/offer`;
    const controller = new AbortController();

    log.debug(`Sending SDP offer to ${url}`);

    // Arm the connection timeout.
    const timeoutId = setTimeout(() => {
      log.warn(
        `Signaling request to ${url} timed out after ${WEBRTC_CONFIG.connectionTimeout}ms`
      );
      controller.abort();
    }, WEBRTC_CONFIG.connectionTimeout);

    try {
      let response: Response;

      try {
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(offer),
          signal: controller.signal,
        });
      } catch (fetchErr) {
        // Distinguish abort (timeout) from genuine network failures.
        if (
          fetchErr instanceof DOMException &&
          fetchErr.name === 'AbortError'
        ) {
          throw new SignalingError(
            `Signaling request timed out after ${WEBRTC_CONFIG.connectionTimeout}ms`,
            'SIGNALING_TIMEOUT'
          );
        }

        const message =
          fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
        throw new SignalingError(
          `Signaling network error: ${message}`,
          'SIGNALING_NETWORK_ERROR'
        );
      }

      if (!response.ok) {
        throw new SignalingError(
          `Signaling server returned HTTP ${response.status}`,
          'SIGNALING_HTTP_ERROR',
          response.status
        );
      }

      const answer = (await response.json()) as SdpAnswer;
      log.debug(`Received SDP answer (type=${answer.type})`);
      return answer;
    } finally {
      // Always clear the timer — prevents it from firing after we've settled.
      clearTimeout(timeoutId);
    }
  }
}
