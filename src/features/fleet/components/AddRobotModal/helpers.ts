import { RECONNECT_MAX_ATTEMPTS } from '@/constants/reconnection';
import { normalizeRosbridgeUrl } from '@/features/fleet/helpers';
import { addRobotSchema } from '@/features/fleet/schemas';
import { connectionManager } from '@/lib/rosbridge/ConnectionManager';

import type { ValidateFailure, ValidateSuccess } from './types/AddRobotModal.types';

/** validateRobotForm
 * @description Validates name and URL with Zod, then normalizes the URL to a
 *  WebSocket address. Returns a discriminated union with parsed values on
 *  success or per-field error messages on failure.
 * @param name - User-entered robot display name.
 * @param url - User-entered rosbridge URL or hostname.
 */
export function validateRobotForm(name: string, url: string): ValidateSuccess | ValidateFailure {
  const result = addRobotSchema.safeParse({ name, url });
  if (!result.success) {
    const issues = result.error.issues;
    const nameIssue = issues.find((i) => i.path[0] === 'name');
    const urlIssue = issues.find((i) => i.path[0] === 'url');
    return { errors: { name: nameIssue?.message, url: urlIssue?.message }, ok: false };
  }

  const normalizedUrl = normalizeRosbridgeUrl(result.data.url);
  if (!normalizedUrl) {
    return {
      errors: { url: 'Invalid URL — enter an IP, hostname, or WebSocket URL' },
      ok: false,
    };
  }

  return { name: result.data.name, ok: true, url: normalizedUrl };
}

/** testConnectionWithRetries
 * @description Attempts a WebSocket connection up to RECONNECT_MAX_ATTEMPTS times,
 *  invoking onAttempt before each try. Returns a discriminated union indicating
 *  success or the final error message.
 * @param url - Normalized WebSocket URL to test.
 * @param onAttempt - Callback invoked with the current attempt number before each try.
 * @param tester - Optional connection test function (defaults to ConnectionManager).
 */
export async function testConnectionWithRetries(
  url: string,
  onAttempt: (attempt: number) => void,
  tester: (url: string) => Promise<void> = (u) => connectionManager.testConnection(u),
): Promise<{ connected: true } | { connected: false; error: string }> {
  for (let attempt = 1; attempt <= RECONNECT_MAX_ATTEMPTS; attempt++) {
    onAttempt(attempt);
    try {
      await tester(url);
      return { connected: true };
    } catch {
      if (attempt === RECONNECT_MAX_ATTEMPTS) {
        return {
          connected: false,
          error: `Failed after ${String(RECONNECT_MAX_ATTEMPTS)} attempts`,
        };
      }
    }
  }
  return { connected: false, error: 'Connection failed' };
}

/** detectMixedContent
 * @description Checks whether a WebSocket URL would trigger a mixed-content block on HTTPS pages.
 * @param url - The WebSocket URL to check.
 */
export function detectMixedContent(url: string): boolean {
  if (typeof window === 'undefined') return false;
  const isHttps = window.location.protocol === 'https:';
  return isHttps && url.startsWith('ws://');
}
