import { useRef, useEffect, useState, useCallback } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeChange } from '@/hooks/useThemeChange';
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
} from '../constants';
import type { PilotLidarMinimapProps } from '../types/PilotView.types';

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
  const [themeVersion, setThemeVersion] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [size, setSize] = useState(clampSize);

  const colorsRef = useRef({
    accent: 'oklch(0.70 0.20 230)',
    textMuted: 'oklch(0.57 0.02 260)',
    gridLine: 'rgba(255,255,255,0.08)',
    nominal: 'oklch(0.70 0.19 155)',
    caution: 'oklch(0.75 0.18 65)',
    critical: 'oklch(0.60 0.24 25)',
  });
  const colorsResolved = useRef(false);

  useThemeChange(() => {
    colorsResolved.current = false;
    setThemeVersion((v) => v + 1);
  });

  // Responsive resize
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    function handleResize() {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setSize(clampSize());
      }, 150);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const resolveColors = useCallback(() => {
    if (colorsResolved.current) return;
    const style = getComputedStyle(document.documentElement);
    colorsRef.current = {
      accent: style.getPropertyValue('--color-accent').trim() || colorsRef.current.accent,
      textMuted: style.getPropertyValue('--color-text-muted').trim() || colorsRef.current.textMuted,
      gridLine: style.getPropertyValue('--color-border').trim() || colorsRef.current.gridLine,
      nominal: style.getPropertyValue('--color-status-nominal').trim() || colorsRef.current.nominal,
      caution: style.getPropertyValue('--color-status-caution').trim() || colorsRef.current.caution,
      critical: style.getPropertyValue('--color-status-critical').trim() || colorsRef.current.critical,
    };
    colorsResolved.current = true;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    resolveColors();
    const colors = colorsRef.current;
    const dpr = window.devicePixelRatio || 1;
    const half = size / 2;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
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

    // Radial edge ticks at 0°/90°/180°/270°
    const tickLen = 4;
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Top (0°)
    ctx.moveTo(half, 1);
    ctx.lineTo(half, 1 + tickLen);
    // Right (90°)
    ctx.moveTo(size - 1, half);
    ctx.lineTo(size - 1 - tickLen, half);
    // Bottom (180°)
    ctx.moveTo(half, size - 1);
    ctx.lineTo(half, size - 1 - tickLen);
    // Left (270°)
    ctx.moveTo(1, half);
    ctx.lineTo(1 + tickLen, half);
    ctx.stroke();

    // Distance labels along horizontal axis
    const scale = (half - 6) / rangeMax * zoom;
    const showAllLabels = size >= 160;
    const labelSteps = showAllLabels ? [0.25, 0.5, 0.75, 1.0] : [0.5, 1.0];

    const fontSize = size >= 160 ? 9 : 8;
    ctx.font = `400 ${String(fontSize)}px "Roboto Mono", monospace`;
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
      if (ratio > 0.7) color = colors.critical;
      else if (ratio > 0.4) color = colors.caution;

      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(px, py, LIDAR_POINT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    ctx.shadowBlur = 0;

    // Robot triangle at center
    const headingRad = (heading * Math.PI) / 180;
    const triSize = Math.max(5, size * 0.035);
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

  }, [points, rangeMax, heading, zoom, size, themeVersion, resolveColors]);

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
