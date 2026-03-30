/**
 * @description normalizeRosbridgeUrl — Normalizes a user-entered URL to a WebSocket URL.
 *  Prefers wss:// (expects nginx reverse proxy), converts http/https schemes,
 *  and prepends wss:// to bare IP/hostname values.
 * @param input - The raw URL string entered by the user.
 * @returns The normalized WebSocket URL, or an empty string if input is blank.
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
