import { RECONNECT_MAX_ATTEMPTS } from '@/constants/reconnection';
import { normalizeRosbridgeUrl } from '@/features/fleet/helpers';
import { addRobotSchema } from '@/features/fleet/schemas';
import { connectionManager } from '@/lib/rosbridge/ConnectionManager';

import type { AddRobotFormErrors } from './types/AddRobotModal.types';

type ValidateSuccess = { ok: true; name: string; url: string };
type ValidateFailure = { ok: false; errors: AddRobotFormErrors };

/** Validate name + url with Zod, then normalize the URL. */
export function validateRobotForm(
  name: string,
  url: string,
): ValidateSuccess | ValidateFailure {
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

/** Test connection with retries, calling onAttempt before each try. */
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

export function detectMixedContent(url: string): boolean {
  if (typeof window === 'undefined') return false;
  const isHttps = window.location.protocol === 'https:';
  return isHttps && url.startsWith('ws://');
}
