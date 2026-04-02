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
