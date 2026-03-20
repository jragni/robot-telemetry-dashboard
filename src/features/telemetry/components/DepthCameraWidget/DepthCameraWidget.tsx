import { useRef } from 'react';

import { useDepthCamera } from '../../hooks/useDepthCamera';
import { useRosConnection } from '../../hooks/useRosConnection';
import { NoConnectionOverlay } from '../NoConnectionOverlay/NoConnectionOverlay';

import type { DepthCameraWidgetProps } from './DepthCameraWidget.types';

import { Show } from '@/shared/components/Show';

export function DepthCameraWidget({
  robotId,
  topicName,
  colormap = 'grayscale',
  showFps = false,
}: DepthCameraWidgetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { isConnected, connectionState } = useRosConnection(robotId);
  const { hasFrame, error, fps } = useDepthCamera({
    robotId,
    topicName,
    canvasRef,
    colormap,
  });

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded bg-slate-900 text-slate-200">
      <Show when={!isConnected}>
        <NoConnectionOverlay
          robotId={robotId}
          connectionState={connectionState}
        />
      </Show>

      {/* Canvas */}
      <div className="relative flex-1">
        <canvas
          ref={canvasRef}
          data-testid="depth-camera-canvas"
          className="h-full w-full object-contain"
          width={640}
          height={480}
        />

        {/* FPS Counter */}
        <Show when={showFps && hasFrame && fps !== null}>
          <div
            data-testid="fps-counter"
            className="absolute right-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs text-green-400"
          >
            {fps?.toFixed(1)} fps
          </div>
        </Show>

        {/* Awaiting feed placeholder */}
        <Show when={!hasFrame && !error}>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-500">
            Awaiting feed…
          </div>
        </Show>

        {/* Error state */}
        <Show when={!!error}>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-red-950/40 text-xs text-red-400">
            {error}
          </div>
        </Show>
      </div>
    </div>
  );
}
