import { type Mock, describe, it, expect, vi, beforeEach } from 'vitest';

import {
  computeValueRange,
  drawGrid,
  drawSeriesLines,
  drawTimeAxis,
  drawValueAxis,
} from './helpers';

interface MockCtx extends CanvasRenderingContext2D {
  beginPath: Mock;
  fillText: Mock;
  lineTo: Mock;
  moveTo: Mock;
  stroke: Mock;
}

function createMockCtx(): MockCtx {
  return {
    beginPath: vi.fn(),
    fillText: vi.fn(),
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    stroke: vi.fn(),
    fillStyle: '',
    font: '',
    lineWidth: 0,
    strokeStyle: '',
    textAlign: 'start' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
  } as unknown as MockCtx;
}

const COLORS = { border: '#333', textMuted: '#999' };

describe('computeValueRange', () => {
  it('returns default range when series is empty', () => {
    const result = computeValueRange([], 0, 1000);
    expect(result.vMin).toBe(0);
    expect(result.vMax).toBeGreaterThan(0);
  });

  it('returns default range when no points in time window', () => {
    const series = [
      { color: '#f00', data: [{ timestamp: 500, value: 10 }], label: 'A' },
    ];
    const result = computeValueRange(series, 1000, 2000);
    expect(result.vMin).toBe(0);
    expect(result.vMax).toBeGreaterThan(0);
  });

  it('computes range from visible points', () => {
    const series = [
      {
        color: '#f00',
        data: [
          { timestamp: 100, value: 5 },
          { timestamp: 200, value: 15 },
        ],
        label: 'A',
      },
    ];
    const result = computeValueRange(series, 0, 300);
    expect(result.vMin).toBe(0);
    expect(result.vMax).toBeGreaterThan(15);
  });

  it('handles negative values without flooring at 0', () => {
    const series = [
      {
        color: '#f00',
        data: [
          { timestamp: 100, value: -10 },
          { timestamp: 200, value: 5 },
        ],
        label: 'A',
      },
    ];
    const result = computeValueRange(series, 0, 300);
    expect(result.vMin).toBeLessThan(-10);
    expect(result.vMax).toBeGreaterThan(5);
  });

  it('handles constant values by expanding range', () => {
    const series = [
      {
        color: '#f00',
        data: [
          { timestamp: 100, value: 7 },
          { timestamp: 200, value: 7 },
        ],
        label: 'A',
      },
    ];
    const result = computeValueRange(series, 0, 300);
    expect(result.vMin).toBe(0);
    expect(result.vMax).toBeGreaterThan(7);
  });

  it('spans multiple series correctly', () => {
    const series = [
      { color: '#f00', data: [{ timestamp: 100, value: 2 }], label: 'A' },
      { color: '#0f0', data: [{ timestamp: 100, value: 20 }], label: 'B' },
    ];
    const result = computeValueRange(series, 0, 200);
    expect(result.vMin).toBe(0);
    expect(result.vMax).toBeGreaterThan(20);
  });
});

describe('drawGrid', () => {
  let ctx: MockCtx;

  beforeEach(() => {
    ctx = createMockCtx();
  });

  it('draws horizontal and vertical grid lines', () => {
    drawGrid(ctx, 400, 200, 40, COLORS);
    // 4 horizontal + 6 vertical = 10 grid divisions, but it's 0..N inclusive
    // H: 5 lines, V: 7 lines = 12 beginPath calls
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.strokeStyle).toBe(COLORS.border);
  });

  it('sets line width to 0.5', () => {
    drawGrid(ctx, 400, 200, 40, COLORS);
    expect(ctx.lineWidth).toBe(0.5);
  });
});

describe('drawTimeAxis', () => {
  let ctx: MockCtx;

  beforeEach(() => {
    ctx = createMockCtx();
  });

  it('renders time labels including "now"', () => {
    drawTimeAxis(ctx, 400, 200, 40, 30000, COLORS);
    const calls = ctx.fillText.mock.calls;
    const labels = calls.map((c: unknown[]) => c[0]);
    expect(labels).toContain('now');
  });

  it('renders negative second labels', () => {
    drawTimeAxis(ctx, 400, 200, 40, 30000, COLORS);
    const calls = ctx.fillText.mock.calls;
    const labels = calls.map((c: unknown[]) => c[0]);
    expect(labels).toContain('-30s');
  });

  it('uses textMuted color', () => {
    drawTimeAxis(ctx, 400, 200, 40, 30000, COLORS);
    expect(ctx.fillStyle).toBe(COLORS.textMuted);
  });
});

describe('drawValueAxis', () => {
  let ctx: MockCtx;

  beforeEach(() => {
    ctx = createMockCtx();
  });

  it('renders value labels', () => {
    drawValueAxis(ctx, 200, 40, 0, 10, COLORS);
    expect(ctx.fillText).toHaveBeenCalled();
    const calls = ctx.fillText.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
  });

  it('uses more decimals for small ranges', () => {
    drawValueAxis(ctx, 200, 40, 0, 0.05, COLORS);
    const calls = ctx.fillText.mock.calls;
    const firstLabel = String(calls[0]?.[0] ?? '');
    // range < 0.1 should use 3 decimal places
    expect(firstLabel).toMatch(/\.\d{3}$/);
  });

  it('uses 1 decimal for large ranges', () => {
    drawValueAxis(ctx, 200, 40, 0, 100, COLORS);
    const calls = ctx.fillText.mock.calls;
    const firstLabel = String(calls[0]?.[0] ?? '');
    expect(firstLabel).toMatch(/\.\d$/);
  });
});

describe('drawSeriesLines', () => {
  let ctx: MockCtx;

  beforeEach(() => {
    ctx = createMockCtx();
  });

  it('draws lines for series with sufficient data', () => {
    const series = [
      {
        color: '#ff0000',
        data: [
          { timestamp: 100, value: 5 },
          { timestamp: 200, value: 10 },
          { timestamp: 300, value: 7 },
        ],
        label: 'Speed',
      },
    ];
    drawSeriesLines(ctx, series, 400, 200, 40, 0, 400, 0, 15, COLORS);
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('skips series with fewer than 2 points', () => {
    const series = [
      { color: '#ff0000', data: [{ timestamp: 100, value: 5 }], label: 'Speed' },
    ];
    drawSeriesLines(ctx, series, 400, 200, 40, 0, 400, 0, 15, COLORS);
    expect(ctx.moveTo).not.toHaveBeenCalled();
  });

  it('renders empty state when no series exist', () => {
    drawSeriesLines(ctx, [], 400, 200, 40, 0, 400, 0, 1, COLORS);
    const calls = ctx.fillText.mock.calls;
    const labels = calls.map((c: unknown[]) => c[0]);
    expect(labels).toContain('No data');
  });

  it('renders empty state when all series have empty data', () => {
    const series = [
      { color: '#ff0000', data: [], label: 'Speed' },
      { color: '#00ff00', data: [], label: 'Temp' },
    ];
    drawSeriesLines(ctx, series, 400, 200, 40, 0, 400, 0, 1, COLORS);
    const calls = ctx.fillText.mock.calls;
    const labels = calls.map((c: unknown[]) => c[0]);
    expect(labels).toContain('No data');
  });

  it('skips points outside the time window', () => {
    const series = [
      {
        color: '#ff0000',
        data: [
          { timestamp: 50, value: 5 },
          { timestamp: 500, value: 10 },
          { timestamp: 150, value: 7 },
          { timestamp: 200, value: 8 },
        ],
        label: 'Speed',
      },
    ];
    drawSeriesLines(ctx, series, 400, 200, 40, 100, 300, 0, 15, COLORS);
    // Only 2 points in range (150, 200), so moveTo once, lineTo once
    expect(ctx.moveTo.mock.calls.length).toBe(1);
    expect(ctx.lineTo.mock.calls.length).toBe(1);
  });
});
