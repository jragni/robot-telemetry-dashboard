/** normalizeRosbridgeUrl
 * @description Normalizes a user-entered URL to a WebSocket URL.
 *  Prefers wss:// (expects nginx reverse proxy), converts http/https schemes,
 *  and prepends wss:// to bare IP/hostname values. Returns empty string if
 *  the input is blank or not a valid URL.
 * @param input - The raw URL string entered by the user.
 * @returns The normalized WebSocket URL, or an empty string if invalid.
 */
export function normalizeRosbridgeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  let wsUrl: string;

  if (trimmed.startsWith('wss://') || trimmed.startsWith('ws://')) {
    wsUrl = trimmed;
  } else if (trimmed.startsWith('https://')) {
    wsUrl = trimmed.replace(/^https:\/\//, 'wss://');
  } else if (trimmed.startsWith('http://')) {
    wsUrl = trimmed.replace(/^http:\/\//, 'ws://');
  } else {
    wsUrl = `wss://${trimmed}`;
  }

  // Validate the result is a parseable URL
  try {
    const parsed = new URL(wsUrl);
    if (parsed.protocol !== 'ws:' && parsed.protocol !== 'wss:') return '';
    return wsUrl;
  } catch {
    return '';
  }
}
