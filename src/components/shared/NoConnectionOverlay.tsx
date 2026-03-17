import { Loader2 } from 'lucide-react';

import type { NoConnectionOverlayProps } from './NoConnectionOverlay.types';
import { Show } from './Show';

import { StatusIndicator } from '@/components/shared/StatusIndicator';
import type { ConnectionState } from '@/types/connection.types';

// ---------------------------------------------------------------------------
// State → message map
// ---------------------------------------------------------------------------

const STATE_MESSAGES: Record<Exclude<ConnectionState, 'connected'>, string> = {
  disconnected: 'Not connected',
  connecting: 'Connecting...',
  error: 'Connection error',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Full-panel overlay displayed whenever the robot connection is not in the
 * 'connected' state. Shows a status indicator and a human-readable message.
 * A spinner is shown during the 'connecting' transient state.
 */
export function NoConnectionOverlay({
  connectionState,
}: NoConnectionOverlayProps) {
  if (connectionState === 'connected') return null;

  const message = STATE_MESSAGES[connectionState];
  const isConnecting = connectionState === 'connecting';

  return (
    <div
      role="status"
      aria-label={message}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm"
    >
      <StatusIndicator state={connectionState} />

      <div className="flex items-center gap-2">
        <Show when={isConnecting}>
          <Loader2
            className="h-4 w-4 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        </Show>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
