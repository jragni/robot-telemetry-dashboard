import { useRef, useEffect, useState, useCallback } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';
import { useCanvasColors } from '@/hooks/useCanvasColors';
import { CANVAS_FALLBACKS } from '@/utils/canvasColors';
import {
  LIDAR_POINT_RADIUS,
  LIDAR_POINT_GLOW,
  MINIMAP_SIZE_MIN,
  MINIMAP_SIZE_MAX,
  MINIMAP_VIEWPORT_RATIO,
  PILOT_ZOOM_MIN,
  PILOT_ZOOM_MAX,
  PILOT_ZOOM_STEP,
  HUD_PANEL_BASE,
  LIDAR_TOKEN_MAP,
  LIDAR_TICK_LENGTH,
  LIDAR_DETAIL_THRESHOLD,
  LIDAR_DISTANCE_RATIO_CAUTION,
  LIDAR_DISTANCE_RATIO_CRITICAL,
  LIDAR_ROBOT_TRIANGLE_RATIO,
  LIDAR_ROBOT_TRIANGLE_MIN,
} from '../constants';
import type { PilotLidarMinimapProps } from '../types/PilotView.types';

/** LIDAR_COLOR_FALLBACKS
 * @description Initial fallback colors for the LiDAR minimap canvas.
 */
const LIDAR_COLOR_FALLBACKS = {
  accent: CANVAS_FALLBACKS.accent,
  textMuted: CANVAS_FALLBACKS.textMuted,
  gridLine: CANVAS_FALLBACKS.border,
  nominal: CANVAS_FALLBACKS.statusNominal,
  caution: CANVAS_FALLBACKS.statusCaution,
  critical: CANVAS_FALLBACKS.statusCritical,
};

/** clampSize
 * @description Derives minimap size from viewport height, clamped to min/max.
 */
function clampSize(): number {
  const derived = Math.floor(window.innerHeight * MINIMAP_VIEWPORT_RATIO);
  return Math.min(MINIMAP_SIZE_MAX, Math.max(MINIMAP_SIZE_MIN, derived));
}

/** PilotLidarMinimap
 * @description Renders a responsive circular LiDAR minimap using Canvas 2D.
 *  Shows dashed cross-hair grid, distance labels along horizontal axis,
 *  radial edge ticks, robot triangle at center, and distance-colored scan
 *  points with radar phosphor glow. Supports zoom via mouse wheel and
 *  +/- buttons. Size scales with viewport height.
 * @param points - Array of LiDAR scan points in Cartesian coordinates.
 * @param rangeMax - Maximum display range in meters.
 * @param heading - Current heading in degrees for robot triangle orientation.
 */
export function PilotLidarMinimap({ points, rangeMax, heading }: PilotLidarMinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const size = useResponsiveSize(clampSize);
  const { colorsRef, themeVersion, resolveColors } = useCanvasColors(
    LIDAR_COLOR_FALLBACKS,
    LIDAR_TOKEN_MAP,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    resolveColors();
    const colors = colorsRef.current;
    const dpr = window.devicePixelRatio || 1;
    const half = size / 2;

    const scaledSize = size * dpr;
    if (canvas.width !== scaledSize) canvas.width = scaledSize;
    if (canvas.height !== scaledSize) canvas.height = scaledSize;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    // Circular clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(half, half, half - 1, 0, Math.PI * 2);
    ctx.clip();

    // Dashed cross-hair grid
    ctx.beginPath();
    ctx.strokeStyle = colors.gridLine;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 4]);
    ctx.moveTo(half, 4);
    ctx.lineTo(half, size - 4);
    ctx.moveTo(4, half);
    ctx.lineTo(size - 4, half);
    ctx.stroke();
    ctx.setLineDash([]);

    // Radial edge ticks at 0/90/180/270 degrees
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(half, 1);
    ctx.lineTo(half, 1 + LIDAR_TICK_LENGTH);
    ctx.moveTo(size - 1, half);
    ctx.lineTo(size - 1 - LIDAR_TICK_LENGTH, half);
    ctx.moveTo(half, size - 1);
    ctx.lineTo(half, size - 1 - LIDAR_TICK_LENGTH);
    ctx.moveTo(1, half);
    ctx.lineTo(1 + LIDAR_TICK_LENGTH, half);
    ctx.stroke();

    // Distance labels along horizontal axis
    const scale = (half - 6) / rangeMax * zoom;
    const showAllLabels = size >= LIDAR_DETAIL_THRESHOLD;
    const labelSteps = showAllLabels ? [0.25, 0.5, 0.75, 1.0] : [0.5, 1.0];

    ctx.font = '400 12px "Roboto Mono", monospace';
    ctx.fillStyle = colors.textMuted;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';

    for (const ratio of labelSteps) {
      const dist = rangeMax * ratio / zoom;
      const labelX = half + dist * scale;
      if (labelX > size - 12) continue;
      const label = `${String(Math.round(rangeMax * ratio / zoom))}m`;
      ctx.fillText(label, labelX + 2, half - 2);
    }

    // Scan points
    ctx.shadowBlur = LIDAR_POINT_GLOW;

    for (const point of points) {
      const px = half + point.x * scale;
      const py = half - point.y * scale;
      const ratio = point.distance / rangeMax;

      let color = colors.nominal;
      if (ratio > LIDAR_DISTANCE_RATIO_CRITICAL) color = colors.critical;
      else if (ratio > LIDAR_DISTANCE_RATIO_CAUTION) color = colors.caution;

      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(px, py, LIDAR_POINT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    ctx.shadowBlur = 0;

    // Robot triangle at center
    const headingRad = (heading * Math.PI) / 180;
    const triSize = Math.max(LIDAR_ROBOT_TRIANGLE_MIN, size * LIDAR_ROBOT_TRIANGLE_RATIO);
    ctx.save();
    ctx.translate(half, half);
    ctx.rotate(-headingRad);
    ctx.beginPath();
    ctx.moveTo(0, -triSize);
    ctx.lineTo(-triSize * 0.6, triSize * 0.5);
    ctx.lineTo(triSize * 0.6, triSize * 0.5);
    ctx.closePath();
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.restore();

    ctx.restore();

  }, [points, rangeMax, heading, zoom, size, themeVersion, resolveColors, colorsRef]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) =>
      Math.min(
        PILOT_ZOOM_MAX,
        Math.max(PILOT_ZOOM_MIN, prev + (e.deltaY > 0 ? -PILOT_ZOOM_STEP : PILOT_ZOOM_STEP)),
      ),
    );
  }, []);

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(PILOT_ZOOM_MAX, prev + PILOT_ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(PILOT_ZOOM_MIN, prev - PILOT_ZOOM_STEP));
  }, []);

  return (
    <div className="flex flex-col items-center gap-1" aria-label="LiDAR minimap">
      <div
        className={`${HUD_PANEL_BASE} overflow-hidden`}
        style={{ width: size, height: size, borderRadius: '50%' }}
      >
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          style={{ width: size, height: size }}
          onWheel={handleWheel}
        />
      </div>
      <div className="flex items-center gap-1 pointer-events-auto">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={zoomOut}
          aria-label="Zoom out"
          className="text-text-muted hover:text-text-primary"
        >
          <Minus className="size-3" />
        </Button>
        <span className="font-mono text-xs text-text-muted tabular-nums w-6 text-center">
          {zoom.toFixed(1)}x
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={zoomIn}
          aria-label="Zoom in"
          className="text-text-muted hover:text-text-primary"
        >
          <Plus className="size-3" />
        </Button>
      </div>
    </div>
  );
}
