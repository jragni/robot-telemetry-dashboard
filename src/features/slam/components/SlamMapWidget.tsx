import { Loader2, Map, RefreshCw } from 'lucide-react';

import { useRobotPosition } from '../hooks/useRobotPosition';
import { useSlamCanvas } from '../hooks/useSlamCanvas';
import { useSlamData } from '../hooks/useSlamData';

import type { PanelComponentProps } from '@/features/panels/panel.types';
import { NoConnectionOverlay } from '@/features/telemetry/shared';
import { useElementSize } from '@/hooks/useElementSize';

// ---------------------------------------------------------------------------
// SlamMapWidget
// ---------------------------------------------------------------------------

/**
 * Panel component that renders a SLAM occupancy grid map on a canvas with
 * d3-zoom pan/zoom support and a live robot position overlay.
 *
 * - On-demand map fetch: the map is only loaded when the user clicks
 *   "Fetch Map". This avoids continuously streaming large grid messages.
 * - Robot position is subscribed to live via odometry.
 * - NoConnectionOverlay is shown when the robot connection is not established.
 * - The canvas tracks its container size via useElementSize so it fills the
 *   panel regardless of drag-resize.
 * - Double-click the canvas to reset the zoom/pan to the default view.
 */
export function SlamMapWidget({ robotId }: PanelComponentProps) {
  const [containerRef, { width, height }] = useElementSize<HTMLDivElement>();

  const { grid, connectionState, fetchMap, isLoading } = useSlamData(robotId);
  const robotPosition = useRobotPosition(robotId);

  const { canvasRef } = useSlamCanvas({ grid, robotPosition });

  const isConnected = connectionState === 'connected';

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-[#0a0a0f]"
    >
      {/* Main canvas — sized to fill the container */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block"
        aria-label="SLAM occupancy grid map"
        title="Double-click to reset zoom"
      />

      {/* Empty state — connected but no map fetched yet */}
      {isConnected && grid === null && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
          <Map
            className="h-10 w-10 text-muted-foreground/30"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground/60">
            No map loaded — click Fetch Map to load
          </p>
        </div>
      )}

      {/* Loading spinner overlay */}
      {isLoading && (
        <div
          role="status"
          aria-label="Loading map data"
          className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm"
        >
          <Loader2
            className="h-8 w-8 animate-spin text-primary"
            aria-hidden="true"
          />
          <span className="sr-only">Loading map data...</span>
        </div>
      )}

      {/* Toolbar — fetch button + zoom hint */}
      {isConnected && (
        <div className="absolute bottom-3 right-3 flex flex-col gap-1">
          <button
            onClick={fetchMap}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded bg-black/70 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/90 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Fetch map from robot"
            title="Fetch latest occupancy grid from the robot"
          >
            <RefreshCw
              className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            Fetch Map
          </button>
        </div>
      )}

      {/* Zoom hint label */}
      {isConnected && grid !== null && (
        <div className="absolute bottom-3 left-3 pointer-events-none">
          <p className="text-[10px] text-muted-foreground/40 select-none">
            Scroll to zoom · Drag to pan · Double-click to reset
          </p>
        </div>
      )}

      {/* Connection overlay — blocks interaction when not connected */}
      {!isConnected && (
        <NoConnectionOverlay connectionState={connectionState} />
      )}
    </div>
  );
}
