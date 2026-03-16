import { useEffect, useRef } from 'react';

import { useDepthCamera } from '../hooks/useDepthCamera';

import type { PanelComponentProps } from '@/features/panels/panel.types';
import { NoConnectionOverlay } from '@/features/telemetry/shared';
import { useElementSize } from '@/hooks/useElementSize';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Panel widget that renders a compressed depth-camera image onto a canvas.
 *
 * The widget receives sensor_msgs/CompressedImage frames from the ROS bridge.
 * Each frame carries base64-encoded image data; the component converts it to
 * a data URI, loads it via an HTML Image element, and draws it to a canvas
 * so the image fills the panel while maintaining its aspect ratio.
 */
export function DepthCameraWidget({ robotId, panelId }: PanelComponentProps) {
  const { frame, connectionState } = useDepthCamera(robotId);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [containerRef, containerSize] = useElementSize<HTMLDivElement>();

  // Draw frame to canvas whenever a new one arrives
  useEffect(() => {
    if (!frame || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = containerSize.width || img.width;
      canvas.height = containerSize.height || img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = `data:image/${frame.format};base64,${frame.data}`;
  }, [frame, containerSize]);

  // Resize canvas when container changes
  useEffect(() => {
    if (!canvasRef.current || !frame) return;
    const canvas = canvasRef.current;
    if (containerSize.width > 0 && containerSize.height > 0) {
      canvas.width = containerSize.width;
      canvas.height = containerSize.height;

      // Redraw last frame at new size
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = `data:image/${frame.format};base64,${frame.data}`;
    }
  }, [containerSize, frame]);

  return (
    <div
      ref={containerRef}
      data-panel-id={panelId}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black"
    >
      <NoConnectionOverlay connectionState={connectionState} />

      <canvas
        ref={canvasRef}
        aria-label="Depth camera feed"
        className="block max-h-full max-w-full"
        width={containerSize.width || 640}
        height={containerSize.height || 480}
      />

      {connectionState === 'connected' && !frame && (
        <p className="absolute text-xs text-muted-foreground">
          Waiting for depth frame…
        </p>
      )}
    </div>
  );
}
