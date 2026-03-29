/**
 * Normalize a user-entered URL to a WebSocket URL.
 * Attempts wss:// first (expects nginx reverse proxy).
 * Falls back patterns:
 *   bare IP/hostname → prepend wss://
 *   http:// → ws://
 *   https:// → wss://
 *   ws:// / wss:// → as-is
 */
export function normalizeRosbridgeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('wss://') || trimmed.startsWith('ws://')) {
    return trimmed;
  }

  if (trimmed.startsWith('https://')) {
    return trimmed.replace(/^https:\/\//, 'wss://');
  }

  if (trimmed.startsWith('http://')) {
    return trimmed.replace(/^http:\/\//, 'ws://');
  }

  // Bare IP or hostname — prefer wss://
  return `wss://${trimmed}`;
}
