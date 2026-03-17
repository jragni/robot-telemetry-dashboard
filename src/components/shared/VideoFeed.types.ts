import type { ReactNode } from 'react';

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
