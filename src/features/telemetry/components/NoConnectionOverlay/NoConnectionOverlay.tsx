import type { NoConnectionOverlayProps } from './NoConnectionOverlay.types';

import { Show } from '@/shared/components/Show';

const MAX_ERROR_LENGTH = 80;

export function NoConnectionOverlay({
  robotId,
  connectionState,
  errorMessage,
}: NoConnectionOverlayProps) {
  const truncatedError =
    errorMessage && errorMessage.length > MAX_ERROR_LENGTH
      ? `${errorMessage.slice(0, MAX_ERROR_LENGTH)}...`
      : errorMessage;

  return (
    <div
      data-testid="no-connection-overlay"
      className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/60 text-sm text-slate-300"
    >
      <Show when={connectionState === 'connecting'}>
        <div className="flex flex-col items-center gap-2">
          <span
            data-testid="overlay-spinner"
            className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"
            role="status"
            aria-label="Connecting"
          />
          <span>Connecting to {robotId}…</span>
        </div>
      </Show>

      <Show when={connectionState === 'disconnected'}>
        <span>Not connected to {robotId}</span>
      </Show>

      <Show when={connectionState === 'error'}>
        <div className="flex flex-col items-center gap-1">
          <span>Connection error</span>
          <Show when={!!truncatedError}>
            <span data-testid="overlay-error-message" className="text-red-400">
              {truncatedError}
            </span>
          </Show>
        </div>
      </Show>
    </div>
  );
}
