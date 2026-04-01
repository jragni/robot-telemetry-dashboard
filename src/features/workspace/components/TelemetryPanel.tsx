import { useRef, useEffect, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { useThemeChange } from '@/hooks/useThemeChange';
import {
  TELEMETRY_GRID_LINES_H,
  TELEMETRY_GRID_LINES_V,
  TELEMETRY_LINE_WIDTH,
  TELEMETRY_AXIS_PADDING,
  TELEMETRY_BOTTOM_PADDING,
} from '@/features/workspace/constants';
import { CANVAS_FALLBACKS } from '@/utils/canvasColors';
import type { TelemetryPanelProps } from '@/features/workspace/types/TelemetryPanel.types';

/** TelemetryPanel
 * @description Renders a Canvas 2D time-series line chart for telemetry data.
 *  Accepts N data series, draws polylines with per-series colors, auto-scaled
 *  value axis, relative time axis. Empty state shows grid with "No data" text.
 * @param series - Array of data series to plot.
 * @param timeWindowMs - Time window in milliseconds to display.
 * @param connected - Whether the robot is currently connected.
 */
export function TelemetryPanel({ series, timeWindowMs, connected }: TelemetryPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(400);
  const [canvasHeight, setCanvasHeight] = useState(200);
  const [themeVersion, setThemeVersion] = useState(0);

  const colorsRef = useRef({
    textMuted: CANVAS_FALLBACKS.textMuted,
    textSecondary: CANVAS_FALLBACKS.textSecondary,
    textPrimary: CANVAS_FALLBACKS.textPrimary,
    border: CANVAS_FALLBACKS.border,
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
        setCanvasWidth(Math.max(entry.contentRect.width, 100));
        setCanvasHeight(Math.max(entry.contentRect.height, 80));
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
      textMuted: styles.getPropertyValue('--color-text-muted') || colorsRef.current.textMuted,
      textSecondary:
        styles.getPropertyValue('--color-text-secondary') || colorsRef.current.textSecondary,
      textPrimary: styles.getPropertyValue('--color-text-primary') || colorsRef.current.textPrimary,
      border: styles.getPropertyValue('--color-border') || colorsRef.current.border,
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

    const w = canvas.width;
    const h = canvas.height;
    const left = TELEMETRY_AXIS_PADDING;
    const bottom = TELEMETRY_BOTTOM_PADDING;
    const plotW = w - left;
    const plotH = h - bottom;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 0.5;

    for (let i = 0; i <= TELEMETRY_GRID_LINES_H; i++) {
      const y = (plotH / TELEMETRY_GRID_LINES_H) * i;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    for (let i = 0; i <= TELEMETRY_GRID_LINES_V; i++) {
      const x = left + (plotW / TELEMETRY_GRID_LINES_V) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, plotH);
      ctx.stroke();
    }

    // Compute value range across all series
    let vMin = Infinity;
    let vMax = -Infinity;
    const now = Date.now();
    const tMin = now - timeWindowMs;

    for (const s of series) {
      for (const pt of s.data) {
        if (pt.timestamp >= tMin && pt.timestamp <= now) {
          if (pt.value < vMin) vMin = pt.value;
          if (pt.value > vMax) vMax = pt.value;
        }
      }
    }

    if (!isFinite(vMin) || !isFinite(vMax)) {
      vMin = 0;
      vMax = 1;
    }
    if (vMin === vMax) {
      vMax += 1;
    }

    // Floor at 0 unless data contains negative values
    if (vMin >= 0) vMin = 0;

    const vRange = vMax - vMin;
    const vPadding = vRange * 0.1;
    vMax += vPadding;
    if (vMin < 0) vMin -= vPadding;

    // Time axis labels
    ctx.font = '12px "Roboto Mono", monospace';
    ctx.fillStyle = c.textMuted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let i = 0; i <= TELEMETRY_GRID_LINES_V; i++) {
      const x = left + (plotW / TELEMETRY_GRID_LINES_V) * i;
      const t = (timeWindowMs / TELEMETRY_GRID_LINES_V) * i;
      const label = t === 0 ? 'now' : `-${String(Math.round(t / 1000))}s`;
      ctx.fillText(label, x, plotH + 4);
    }

    // Value axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= TELEMETRY_GRID_LINES_H; i++) {
      const y = (plotH / TELEMETRY_GRID_LINES_H) * i;
      const val = vMax - ((vMax - vMin) / TELEMETRY_GRID_LINES_H) * i;
      ctx.fillText(val.toFixed(1), left - 4, y);
    }

    // Draw series lines
    if (series.length > 0) {
      for (const s of series) {
        if (s.data.length < 2) continue;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = TELEMETRY_LINE_WIDTH;
        ctx.beginPath();

        let started = false;
        for (const pt of s.data) {
          if (pt.timestamp < tMin || pt.timestamp > now) continue;
          const x = left + (1 - (pt.timestamp - tMin) / timeWindowMs) * plotW;
          const y = plotH - ((pt.value - vMin) / (vMax - vMin)) * plotH;

          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    }

    // Empty state
    if (series.length === 0 || series.every((s) => s.data.length === 0)) {
      ctx.font = '12px "Roboto Mono", monospace';
      ctx.fillStyle = c.textMuted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No data', left + plotW / 2, plotH / 2);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps -- themeVersion triggers redraw on theme switch
  }, [series, timeWindowMs, resolveColors, themeVersion]);

  useEffect(() => {
    draw();
  }, [draw, canvasWidth, canvasHeight]);

  const seriesCount = series.length;
  const totalPoints = series.reduce((sum, s) => sum + s.data.length, 0);

  return (
    <div className={cn('flex flex-col gap-2 w-full h-full', !connected && 'opacity-50')}>
      <div ref={containerRef} className="flex-1 w-full min-h-0">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{ width: '100%', height: '100%' }}
          aria-label={`Telemetry chart: ${String(seriesCount)} series, ${String(totalPoints)} points, ${String(Math.round(timeWindowMs / 1000))}s window`}
        />
      </div>
      <div className="flex items-center gap-3 font-mono text-xs shrink-0 px-1 overflow-x-auto flex-wrap">
        {series.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="w-3 h-px inline-block" style={{ backgroundColor: s.color }} />
            <span className="font-sans text-text-secondary">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
