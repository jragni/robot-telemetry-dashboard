/**
 * ROS Helper Functions
 *
 * Utility functions for ROS URL management and path derivation.
 */

/**
 * Derives the rosbridge WebSocket URL from a base URL
 *
 * @param baseUrl - Base URL (e.g., "wss://abc123.loca.lt")
 * @returns Full rosbridge URL (e.g., "wss://abc123.loca.lt/rosbridge")
 *
 * @example
 * deriveRosbridgeUrl("wss://example.com") // "wss://example.com/rosbridge"
 * deriveRosbridgeUrl("ws://localhost:8000") // "ws://localhost:8000/rosbridge"
 */
export function deriveRosbridgeUrl(baseUrl: string): string {
  if (!baseUrl) {
    return '';
  }

  // Remove trailing slash if present
  const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  // Append /rosbridge path
  return `${cleanUrl}/rosbridge`;
}

/**
 * Derives the WebRTC signaling URL from a base URL
 *
 * @param baseUrl - Base URL (e.g., "wss://abc123.loca.lt")
 * @returns Full WebRTC signaling URL (e.g., "wss://abc123.loca.lt/webrtc")
 *
 * @example
 * deriveWebRTCUrl("wss://example.com") // "wss://example.com/webrtc"
 * deriveWebRTCUrl("ws://localhost:8000") // "ws://localhost:8000/webrtc"
 */
export function deriveWebRTCUrl(baseUrl: string): string {
  if (!baseUrl) {
    return '';
  }

  // Remove trailing slash if present
  const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  // Append /webrtc path
  return `${cleanUrl}/webrtc`;
}

/**
 * Validates that a URL is a proper WebSocket URL
 *
 * @param url - URL to validate
 * @returns true if URL is valid WebSocket URL (ws:// or wss://)
 */
export function isValidWebSocketUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'ws:' || urlObj.protocol === 'wss:';
  } catch {
    return false;
  }
}

/**
 * Extracts the base URL from a full rosbridge or WebRTC URL
 *
 * Useful for backwards compatibility if users enter full paths
 *
 * @param url - Full URL with path (e.g., "wss://example.com/rosbridge")
 * @returns Base URL without path (e.g., "wss://example.com")
 *
 * @example
 * extractBaseUrl("wss://example.com/rosbridge") // "wss://example.com"
 * extractBaseUrl("wss://example.com") // "wss://example.com"
 */
export function extractBaseUrl(url: string): string {
  if (!url) {
    return '';
  }

  try {
    const urlObj = new URL(url);
    // Return protocol + hostname + port (if specified)
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch {
    return url; // Return original if parsing fails
  }
}
