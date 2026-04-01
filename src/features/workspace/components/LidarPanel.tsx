import { useRef, useEffect, useCallback, useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useThemeChange } from '@/hooks/useThemeChange';
import {
  LIDAR_ZOOM_MIN,
  LIDAR_ZOOM_MAX,
  LIDAR_ZOOM_STEP,
  LIDAR_GRID_LINE_COUNT,
  LIDAR_POINT_RADIUS,
  LIDAR_ROBOT_SIZE,
} from '@/features/workspace/constants';
import { CANVAS_FALLBACKS } from '@/utils/canvasColors';
import type { LidarPanelProps } from '@/features/workspace/types/LidarPanel.types';

/** LidarPanel
 * @description Renders a top-down 2D tactical display of LiDAR scan points.
 *  Points colored by distance (close=critical, mid=caution, far=nominal).
 *  Robot shown as a centered triangle. Cartesian grid with crosshair and
 *  range circles for spatial reference. Supports zoom via mouse wheel.
 * @param points - Array of LiDAR scan points in polar coordinates.
 * @param rangeMax - Maximum sensor range in meters.
 * @param connected - Whether the robot is currently connected.
 */
export function LidarPanel({ points, rangeMax, connected }: LidarPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState(300);
  const [themeVersion, setThemeVersion] = useState(0);

  const colorsRef = useRef({
    border: CANVAS_FALLBACKS.border,
    textPrimary: CANVAS_FALLBACKS.textPrimary,
    textSecondary: CANVAS_FALLBACKS.textSecondary,
    textMuted: CANVAS_FALLBACKS.textMuted,
    accent: CANVAS_FALLBACKS.accent,
    critical: CANVAS_FALLBACKS.statusCritical,
    caution: CANVAS_FALLBACKS.statusCaution,
    nominal: CANVAS_FALLBACKS.statusNominal,
    surfaceBase: CANVAS_FALLBACKS.surfaceBase,
  });
  const colorsResolved = useRef(false);

  useThemeChange(() => {
    colorsResolved.current = false;
    setThemeVersion((v) => v + 1);
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const size = Math.min(entry.contentRect.width, entry.contentRect.height);
        setCanvasSize(Math.max(size, 100));
      }
    });

    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, []);

  const resolveColors = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || colorsResolved.current) return;
    const styles = getComputedStyle(canvas);
    colorsRef.current = {
      border: styles.getPropertyValue('--color-border') || colorsRef.current.border,
      textPrimary: styles.getPropertyValue('--color-text-primary') || colorsRef.current.textPrimary,
      textSecondary:
        styles.getPropertyValue('--color-text-secondary') || colorsRef.current.textSecondary,
      textMuted: styles.getPropertyValue('--color-text-muted') || colorsRef.current.textMuted,
      accent: styles.getPropertyValue('--color-accent') || colorsRef.current.accent,
      critical: styles.getPropertyValue('--color-status-critical') || colorsRef.current.critical,
      caution: styles.getPropertyValue('--color-status-caution') || colorsRef.current.caution,
      nominal: styles.getPropertyValue('--color-status-nominal') || colorsRef.current.nominal,
      surfaceBase: styles.getPropertyValue('--color-surface-base') || colorsRef.current.surfaceBase,
    };
    colorsResolved.current = true;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    resolveColors();
    const c = colorsRef.current;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const scale = (size / 2 / rangeMax) * zoom;

    ctx.clearRect(0, 0, size, size);

    // Semi-transparent background — tactical radar scope effect
    ctx.fillStyle = c.surfaceBase;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(0, 0, size, size);
    ctx.globalAlpha = 1;

    // Grid lines
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = c.textMuted;
    ctx.lineWidth = 0.5;
    const gridSpacing = size / LIDAR_GRID_LINE_COUNT;
    for (let i = 1; i < LIDAR_GRID_LINE_COUNT; i++) {
      const pos = i * gridSpacing;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(size, pos);
      ctx.stroke();
    }

    // Center crosshair
    ctx.strokeStyle = c.textPrimary;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(size, cy);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Range circles at 50% and 100%
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 1;
    const halfRange = (rangeMax / 2) * scale;
    const fullRange = rangeMax * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, halfRange, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, fullRange, 0, Math.PI * 2);
    ctx.stroke();

    // Range labels — positioned inside the circle to avoid clipping
    ctx.font = '12px "Roboto Mono", monospace';
    ctx.fillStyle = c.textMuted;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${String(rangeMax / 2)}m`, cx + halfRange - 4, cy - 4);
    ctx.fillText(`${String(rangeMax)}m`, cx + fullRange - 4, cy - 4);

    // Scan points
    if (connected) {
      for (const point of points) {
        const dist = point.distance;
        const ratio = Math.min(dist / rangeMax, 1);
        const x = cx + Math.cos(point.angle) * dist * scale;
        const y = cy - Math.sin(point.angle) * dist * scale;

        if (x < 0 || x > size || y < 0 || y > size) continue;

        ctx.fillStyle = ratio < 0.3 ? c.critical : ratio < 0.6 ? c.caution : c.nominal;
        ctx.beginPath();
        ctx.arc(x, y, LIDAR_POINT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Robot triangle — scale with canvas
    const robotSize = Math.max(LIDAR_ROBOT_SIZE, size * 0.02);
    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.moveTo(cx, cy - robotSize);
    ctx.lineTo(cx - robotSize * 0.7, cy + robotSize * 0.5);
    ctx.lineTo(cx + robotSize * 0.7, cy + robotSize * 0.5);
    ctx.closePath();
    ctx.fill();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- themeVersion triggers redraw on theme switch
  }, [points, rangeMax, connected, zoom, resolveColors, themeVersion]);

  useEffect(() => {
    draw();
  }, [draw, canvasSize]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) =>
      Math.min(
        LIDAR_ZOOM_MAX,
        Math.max(LIDAR_ZOOM_MIN, prev + (e.deltaY > 0 ? -LIDAR_ZOOM_STEP : LIDAR_ZOOM_STEP)),
      ),
    );
  }, []);

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(LIDAR_ZOOM_MAX, prev + LIDAR_ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(LIDAR_ZOOM_MIN, prev - LIDAR_ZOOM_STEP));
  }, []);

  const closestPoint = points.length > 0 ? Math.min(...points.map((p) => p.distance)) : null;

  return (
    <div
      className={cn('flex flex-col items-center gap-2 w-full h-full', !connected && 'opacity-50')}
    >
      <div ref={containerRef} className="flex-1 flex items-center justify-center w-full min-h-0 aspect-square max-h-full">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          style={{ width: canvasSize, height: canvasSize }}
          onWheel={handleWheel}
          aria-label={`LiDAR scan: ${String(points.length)} points, range ${String(rangeMax)}m${closestPoint !== null ? `, closest ${String(Math.round(closestPoint * 10) / 10)}m` : ''}`}
        />
      </div>
      <div className="flex items-center gap-4 font-mono text-xs shrink-0">
        <span className="text-text-muted">
          <span className="font-sans">PTS</span>{' '}
          <span className="text-text-primary tabular-nums">{String(points.length)}</span>
        </span>
        <span className="text-text-muted">
          <span className="font-sans">RANGE</span>{' '}
          <span className="text-text-primary tabular-nums">{String(rangeMax)}m</span>
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={zoomOut}
            aria-label="Zoom out"
            className="text-text-muted hover:text-text-primary"
          >
            <Minus className="size-3" />
          </Button>
          <span className="text-text-primary tabular-nums w-8 text-center">{zoom.toFixed(1)}x</span>
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
    </div>
  );
}
