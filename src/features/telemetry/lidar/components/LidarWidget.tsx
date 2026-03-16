import { ZoomIn, ZoomOut } from 'lucide-react';

import { useLidarCanvas } from '../hooks/useLidarCanvas';
import { useLidarData } from '../hooks/useLidarData';

import type { PanelComponentProps } from '@/features/panels/panel.types';
import { NoConnectionOverlay } from '@/features/telemetry/shared';
import { useElementSize } from '@/hooks/useElementSize';

// ---------------------------------------------------------------------------
// LidarWidget
// ---------------------------------------------------------------------------

/**
 * Panel component that renders a live LiDAR point cloud on a canvas.
 *
 * - Subscribes to the /scan topic via useLidarData.
 * - Renders each frame via useLidarCanvas / renderLidarFrame.
 * - Tracks container dimensions with useElementSize so the canvas fills its
 *   parent regardless of panel resize.
 * - Exposes zoom-in / zoom-out controls that adjust pixels-per-metre scale.
 * - Shows NoConnectionOverlay when the ROS connection is not established.
 */
export function LidarWidget({ robotId }: PanelComponentProps) {
  const [containerRef, { width, height }] = useElementSize<HTMLDivElement>();

  const { data, connectionState } = useLidarData(robotId);

  const { canvasRef, zoomIn, zoomOut, scale } = useLidarCanvas(
    data,
    width,
    height
  );

  const isConnected = connectionState === 'connected';

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-[#0a0a0f]"
    >
      {/* Main canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block"
        aria-label="LiDAR point cloud"
      />

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1">
        <button
          onClick={zoomIn}
          className="flex h-8 w-8 items-center justify-center rounded bg-black/60 text-white hover:bg-black/80 active:scale-95 transition-transform"
          aria-label="Zoom in"
          title={`Zoom in (${scale} px/m)`}
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={zoomOut}
          className="flex h-8 w-8 items-center justify-center rounded bg-black/60 text-white hover:bg-black/80 active:scale-95 transition-transform"
          aria-label="Zoom out"
          title={`Zoom out (${scale} px/m)`}
        >
          <ZoomOut className="h-4 w-4" />
        </button>
      </div>

      {/* Connection overlay */}
      {!isConnected && (
        <NoConnectionOverlay connectionState={connectionState} />
      )}
    </div>
  );
}
