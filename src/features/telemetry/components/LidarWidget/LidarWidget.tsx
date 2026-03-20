import { useEffect, useRef, useState } from 'react';

import { useLidarScan } from '../../hooks/useLidarScan';
import { useRosConnection } from '../../hooks/useRosConnection';
import { NoConnectionOverlay } from '../NoConnectionOverlay/NoConnectionOverlay';

import type { LidarWidgetProps } from './LidarWidget.types';

import { Show } from '@/shared/components/Show';

const DEFAULT_ZOOM = 1;
const ZOOM_STEP = 1.25;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 20;

const POINT_RADIUS = 1.5;
const POINT_COLOR = '#00e5ff';
const GRID_COLOR = 'rgba(100,120,140,0.3)';
const ROBOT_COLOR = '#ffcc00';

export function LidarWidget({
  robotId,
  topicName,
  maxRange = 10,
}: LidarWidgetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  const { isConnected, connectionState } = useRosConnection(robotId);
  const { scanPoints, hasData } = useLidarScan(robotId, topicName, maxRange);

  // Draw on canvas whenever scan or zoom changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const cx = width / 2;
    const cy = height / 2;
    const scale = (Math.min(width, height) / 2 / maxRange) * zoom;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, width, height);

    // Grid rings
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    for (let r = 1; r <= maxRange; r++) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Scan points
    ctx.fillStyle = POINT_COLOR;
    for (let i = 0; i < scanPoints.length; i += 2) {
      const x = cx + scanPoints[i] * scale;
      const y = cy - scanPoints[i + 1] * scale; // flip Y axis
      ctx.beginPath();
      ctx.arc(x, y, POINT_RADIUS, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Robot origin dot
    ctx.fillStyle = ROBOT_COLOR;
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
    ctx.fill();
  }, [scanPoints, zoom, maxRange]);

  const handleZoomIn = () => setZoom((z) => Math.min(z * ZOOM_STEP, MAX_ZOOM));
  const handleZoomOut = () => setZoom((z) => Math.max(z / ZOOM_STEP, MIN_ZOOM));
  const handleZoomReset = () => setZoom(DEFAULT_ZOOM);

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded bg-slate-900 text-slate-200">
      <Show when={!isConnected}>
        <NoConnectionOverlay
          robotId={robotId}
          connectionState={connectionState}
        />
      </Show>

      {/* Zoom controls */}
      <div className="flex shrink-0 items-center gap-1 border-b border-slate-700 px-3 py-2">
        <button
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="rounded px-2 py-1 text-xs hover:bg-slate-700"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="rounded px-2 py-1 text-xs hover:bg-slate-700"
        >
          −
        </button>
        <button
          onClick={handleZoomReset}
          aria-label="Reset zoom"
          className="rounded px-2 py-1 text-xs hover:bg-slate-700"
        >
          Reset
        </button>
        <span className="ml-auto text-xs text-slate-500">
          {zoom.toFixed(1)}×
        </span>
      </div>

      {/* Canvas */}
      <div className="relative flex-1">
        <canvas
          ref={canvasRef}
          data-testid="lidar-canvas"
          className="h-full w-full"
          width={400}
          height={400}
        />
        <Show when={!hasData}>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-500">
            No scan data
          </div>
        </Show>
      </div>
    </div>
  );
}
