export function detectMixedContent(url: string): boolean {
  if (typeof window === 'undefined') return false;
  const isHttps = window.location.protocol === 'https:';
  return isHttps && url.startsWith('ws://');
}
