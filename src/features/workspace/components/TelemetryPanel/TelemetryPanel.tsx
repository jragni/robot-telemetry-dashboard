import { useRef, useEffect, useCallback, useState } from 'react';

import { cn } from '@/lib/utils';
import { useCanvasColors } from '@/hooks/useCanvasColors';
import {
  TELEMETRY_AXIS_PADDING,
  TELEMETRY_BOTTOM_PADDING,
  TELEMETRY_COLOR_FALLBACKS,
  TELEMETRY_TOKEN_MAP,
} from '@/features/workspace/constants';
import type { TelemetryPanelProps } from '@/features/workspace/types/TelemetryPanel.types';

import {
  computeValueRange,
  drawGrid,
  drawSeriesLines,
  drawTimeAxis,
  drawValueAxis,
} from './helpers';

/** TelemetryPanel
 * @description Renders a Canvas 2D time-series line chart for telemetry data.
 *  Accepts N data series, draws polylines with per-series colors, auto-scaled
 *  value axis, relative time axis. Empty state shows grid with "No data" text.
 * @param series - Array of data series to plot.
 * @param timeWindowMs - Time window in milliseconds to display.
 * @param connected - Whether the robot is currently connected.
 */
export function TelemetryPanel({ connected, series, timeWindowMs }: TelemetryPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(400);
  const [canvasHeight, setCanvasHeight] = useState(200);

  const { colorsRef, themeVersion, resolveColors } = useCanvasColors(
    TELEMETRY_COLOR_FALLBACKS,
    TELEMETRY_TOKEN_MAP,
  );

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

    const now = Date.now();
    const tMin = now - timeWindowMs;
    const { vMax, vMin } = computeValueRange(series, tMin, now);

    drawGrid(ctx, plotW, plotH, left, c);
    drawTimeAxis(ctx, plotW, plotH, left, timeWindowMs, c);
    drawValueAxis(ctx, plotH, left, vMin, vMax, c);
    drawSeriesLines(ctx, series, plotW, plotH, left, tMin, now, vMin, vMax, c);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- themeVersion forces redraw on theme change
  }, [series, timeWindowMs, resolveColors, themeVersion, colorsRef]);

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
