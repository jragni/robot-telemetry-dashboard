import {
  TELEMETRY_GRID_LINES_H,
  TELEMETRY_GRID_LINES_V,
  TELEMETRY_LINE_WIDTH,
} from '@/features/workspace/constants';
import type { TelemetrySeries } from '@/features/workspace/types/TelemetryPanel.types';

import type { CanvasColors, ValueRange } from './helpers.types';

/** drawGrid
 * @description Draws horizontal and vertical grid lines on the canvas plot area.
 * @param ctx - Canvas 2D rendering context.
 * @param plotW - Width of the plot area in pixels.
 * @param plotH - Height of the plot area in pixels.
 * @param left - Left offset (axis padding) in pixels.
 * @param colors - Resolved canvas color tokens.
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  plotW: number,
  plotH: number,
  left: number,
  colors: CanvasColors,
): void {
  const w = left + plotW;

  ctx.strokeStyle = colors.border;
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
}

/** computeValueRange
 * @description Computes the min/max value range across all series within the visible
 *  time window. Applies padding, floors at 0 for non-negative data, and handles
 *  edge cases (no data, constant values).
 * @param series - Array of telemetry data series.
 * @param tMin - Start of visible time window (epoch ms).
 * @param now - Current timestamp (epoch ms).
 * @returns Object with vMin and vMax for the value axis.
 */
export function computeValueRange(
  series: readonly TelemetrySeries[],
  tMin: number,
  now: number,
): ValueRange {
  let vMin = Infinity;
  let vMax = -Infinity;

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

  return { vMax, vMin };
}

/** drawTimeAxis
 * @description Draws time axis labels along the bottom of the plot area.
 *  Labels show relative time (e.g., "-5s", "now"). First and last labels
 *  are aligned to avoid clipping at edges.
 * @param ctx - Canvas 2D rendering context.
 * @param plotW - Width of the plot area in pixels.
 * @param plotH - Height of the plot area in pixels.
 * @param left - Left offset (axis padding) in pixels.
 * @param timeWindowMs - Total time window displayed in milliseconds.
 * @param colors - Resolved canvas color tokens.
 */
export function drawTimeAxis(
  ctx: CanvasRenderingContext2D,
  plotW: number,
  plotH: number,
  left: number,
  timeWindowMs: number,
  colors: CanvasColors,
): void {
  ctx.font = '12px "Roboto Mono", monospace';
  ctx.fillStyle = colors.textMuted;
  ctx.textBaseline = 'top';

  for (let i = 0; i <= TELEMETRY_GRID_LINES_V; i++) {
    const x = left + (plotW / TELEMETRY_GRID_LINES_V) * i;
    const t = (timeWindowMs / TELEMETRY_GRID_LINES_V) * i;
    const label = t === 0 ? 'now' : `-${String(Math.round(t / 1000))}s`;
    ctx.textAlign = i === 0 ? 'left' : i === TELEMETRY_GRID_LINES_V ? 'right' : 'center';
    ctx.fillText(label, x, plotH + 4);
  }
}

/** drawValueAxis
 * @description Draws value axis labels along the left side of the plot area.
 *  Automatically selects decimal precision based on the value range.
 * @param ctx - Canvas 2D rendering context.
 * @param plotH - Height of the plot area in pixels.
 * @param left - Left offset (axis padding) in pixels.
 * @param vMin - Minimum value on the axis.
 * @param vMax - Maximum value on the axis.
 * @param colors - Resolved canvas color tokens.
 */
export function drawValueAxis(
  ctx: CanvasRenderingContext2D,
  plotH: number,
  left: number,
  vMin: number,
  vMax: number,
  colors: CanvasColors,
): void {
  ctx.font = '12px "Roboto Mono", monospace';
  ctx.fillStyle = colors.textMuted;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  const decimals = vMax - vMin < 0.1 ? 3 : vMax - vMin < 1 ? 2 : 1;

  for (let i = 0; i <= TELEMETRY_GRID_LINES_H; i++) {
    const y = Math.max(8, (plotH / TELEMETRY_GRID_LINES_H) * i);
    const val = vMax - ((vMax - vMin) / TELEMETRY_GRID_LINES_H) * i;
    ctx.fillText(val.toFixed(decimals), left - 4, y);
  }
}

/** drawSeriesLines
 * @description Draws polylines for each telemetry series on the plot area.
 *  Points outside the visible time window are skipped. If no data is present,
 *  renders a "No data" empty state message.
 * @param ctx - Canvas 2D rendering context.
 * @param series - Array of telemetry data series.
 * @param plotW - Width of the plot area in pixels.
 * @param plotH - Height of the plot area in pixels.
 * @param left - Left offset (axis padding) in pixels.
 * @param tMin - Start of visible time window (epoch ms).
 * @param now - Current timestamp (epoch ms).
 * @param vMin - Minimum value on the axis.
 * @param vMax - Maximum value on the axis.
 * @param colors - Resolved canvas color tokens for the empty state text.
 */
export function drawSeriesLines(
  ctx: CanvasRenderingContext2D,
  series: readonly TelemetrySeries[],
  plotW: number,
  plotH: number,
  left: number,
  tMin: number,
  now: number,
  vMin: number,
  vMax: number,
  colors: CanvasColors,
): void {
  const timeWindowMs = now - tMin;

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
    ctx.fillStyle = colors.textMuted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No data', left + plotW / 2, plotH / 2);
  }
}
