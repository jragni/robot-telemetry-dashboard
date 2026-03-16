import type { ReactNode } from 'react';

/**
 * Signaling error thrown by SignalingClient on fetch failures.
 */
export class SignalingError extends Error {
  override readonly name = 'SignalingError' as const;
  readonly statusCode?: number;
  readonly code: string;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Derived UI status for the video feed component.
 * Maps from ConnectionState + MediaStream presence.
 */
export type VideoFeedStatus =
  | 'idle'
  | 'connecting'
  | 'streaming'
  | 'error'
  | 'disconnected';

/**
 * Props for the VideoFeed component.
 */
export interface VideoFeedProps {
  robotId: string;
  className?: string;
  showStatusOverlay?: boolean;
  muted?: boolean;
  onStreamStart?: () => void;
  onStreamEnd?: () => void;
  children?: ReactNode;
}
