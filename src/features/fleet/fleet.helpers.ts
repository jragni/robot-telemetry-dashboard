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

export function formatLastSeen(timestamp: number | null): string {
  if (timestamp == null) return '—';
  const delta = Date.now() - timestamp;
  if (delta < 5000) return 'just now';
  if (delta < 60000) return `${String(Math.floor(delta / 1000))}s ago`;
  if (delta < 3600000) return `${String(Math.floor(delta / 60000))}m ago`;
  return new Date(timestamp).toLocaleTimeString();
}
