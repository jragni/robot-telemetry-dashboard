import { describe, it, expect, vi } from 'vitest';

import type { ParsedOccupancyGrid } from './slam.types';
import {
  parseOccupancyGrid,
  cellToColor,
  renderOccupancyGrid,
  worldToGrid,
  renderRobotMarker,
} from './slam.utils';

import type { OccupancyGridMessage } from '@/types/ros-messages';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface MockContext extends CanvasRenderingContext2D {
  putImageData: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  translate: ReturnType<typeof vi.fn>;
  scale: ReturnType<typeof vi.fn>;
  rotate: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  closePath: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  clearRect: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  createImageData: ReturnType<typeof vi.fn>;
  setTransform: ReturnType<typeof vi.fn>;
}

function createMockContext(): MockContext {
  return {
    putImageData: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    setTransform: vi.fn(),
    createImageData: vi
      .fn()
      .mockImplementation((width: number, height: number) => {
        return {
          width,
          height,
          data: new Uint8ClampedArray(width * height * 4),
        };
      }),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    set fillStyle(_: string) {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    set strokeStyle(_: string) {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    set lineWidth(_: number) {},
  } as unknown as MockContext;
}

/**
 * Builds a minimal OccupancyGridMessage with sensible defaults.
 * Individual properties can be overridden via the partial argument.
 */
function buildGridMessage(
  overrides: Partial<OccupancyGridMessage> = {}
): OccupancyGridMessage {
  return {
    header: {
      stamp: { sec: 1000, nsec: 0 },
      frame_id: 'map',
    },
    info: {
      resolution: 0.05,
      width: 4,
      height: 3,
      origin: {
        position: { x: -1.0, y: -0.75, z: 0 },
        orientation: { x: 0, y: 0, z: 0, w: 1 },
      },
    },
    data: [0, 100, -1, 50, 0, 0, 100, -1, 0, 50, 100, 0],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// parseOccupancyGrid
// ---------------------------------------------------------------------------

describe('parseOccupancyGrid', () => {
  it('extracts width from info', () => {
    const msg = buildGridMessage();
    const result = parseOccupancyGrid(msg);
    expect(result.width).toBe(4);
  });

  it('extracts height from info', () => {
    const msg = buildGridMessage();
    const result = parseOccupancyGrid(msg);
    expect(result.height).toBe(3);
  });

  it('extracts resolution from info', () => {
    const msg = buildGridMessage();
    const result = parseOccupancyGrid(msg);
    expect(result.resolution).toBeCloseTo(0.05, 5);
  });

  it('converts data array to Int8Array', () => {
    const msg = buildGridMessage({ data: [0, 100, -1] });
    const result = parseOccupancyGrid(msg);
    expect(result.cells).toBeInstanceOf(Int8Array);
    expect(result.cells[0]).toBe(0);
    expect(result.cells[1]).toBe(100);
    expect(result.cells[2]).toBe(-1);
  });

  it('reads origin X position from info.origin.position.x', () => {
    const msg = buildGridMessage();
    const result = parseOccupancyGrid(msg);
    expect(result.originX).toBeCloseTo(-1.0, 5);
  });

  it('reads origin Y position from info.origin.position.y', () => {
    const msg = buildGridMessage();
    const result = parseOccupancyGrid(msg);
    expect(result.originY).toBeCloseTo(-0.75, 5);
  });

  it('handles empty data array', () => {
    const msg = buildGridMessage({ data: [] });
    const result = parseOccupancyGrid(msg);
    expect(result.cells).toBeInstanceOf(Int8Array);
    expect(result.cells.length).toBe(0);
  });

  it('computes timestamp from header stamp', () => {
    const msg = buildGridMessage({
      header: { stamp: { sec: 10, nsec: 500_000_000 }, frame_id: 'map' },
    });
    const result = parseOccupancyGrid(msg);
    // timestamp = sec * 1000 + nsec / 1_000_000
    expect(result.timestamp).toBeCloseTo(10_500, 0);
  });

  it('preserves all cell values in order', () => {
    const data = [0, 50, 100, -1, 75, 25];
    const msg = buildGridMessage({
      data,
      info: { ...buildGridMessage().info, width: 6, height: 1 },
    });
    const result = parseOccupancyGrid(msg);
    expect(Array.from(result.cells)).toEqual(data);
  });
});

// ---------------------------------------------------------------------------
// cellToColor
// ---------------------------------------------------------------------------

describe('cellToColor', () => {
  it('returns the unknown color for -1', () => {
    const [r, g, b] = cellToColor(-1);
    // -1 (unknown) → [40, 40, 50] (dark gray-blue)
    expect(r).toBe(40);
    expect(g).toBe(40);
    expect(b).toBe(50);
  });

  it('returns the free color for 0', () => {
    const [r, g, b] = cellToColor(0);
    // 0 (free) → [15, 20, 30] (near-black)
    expect(r).toBe(15);
    expect(g).toBe(20);
    expect(b).toBe(30);
  });

  it('returns the occupied color for 100', () => {
    const [r, g, b] = cellToColor(100);
    // 100 (occupied) → [200, 210, 230] (light)
    expect(r).toBe(200);
    expect(g).toBe(210);
    expect(b).toBe(230);
  });

  it('returns an array of exactly 3 numbers', () => {
    const color = cellToColor(50);
    expect(color).toHaveLength(3);
    expect(typeof color[0]).toBe('number');
    expect(typeof color[1]).toBe('number');
    expect(typeof color[2]).toBe('number');
  });

  it('interpolates intermediate values between free and occupied', () => {
    const [r0] = cellToColor(0);
    const [r50] = cellToColor(50);
    const [r100] = cellToColor(100);
    // 50 should be between free and occupied
    expect(r50).toBeGreaterThan(r0);
    expect(r50).toBeLessThan(r100);
  });

  it('clamps values below 0 to the unknown color', () => {
    const negResult = cellToColor(-1);
    const clampedResult = cellToColor(-99);
    expect(clampedResult).toEqual(negResult);
  });
});

// ---------------------------------------------------------------------------
// renderOccupancyGrid
// ---------------------------------------------------------------------------

describe('renderOccupancyGrid', () => {
  const CANVAS_W = 400;
  const CANVAS_H = 300;
  const transform = { k: 1, x: 0, y: 0 };

  const sampleGrid: ParsedOccupancyGrid = {
    width: 4,
    height: 3,
    resolution: 0.05,
    originX: -1.0,
    originY: -0.75,
    cells: new Int8Array([0, 100, -1, 50, 0, 0, 100, -1, 0, 50, 100, 0]),
    timestamp: 1000,
  };

  it('calls ctx.putImageData exactly once', () => {
    const ctx = createMockContext();
    renderOccupancyGrid(ctx, sampleGrid, CANVAS_W, CANVAS_H, transform);
    expect(ctx.putImageData).toHaveBeenCalledOnce();
  });

  it('creates ImageData with grid dimensions (width * height pixels)', () => {
    const ctx = createMockContext();
    renderOccupancyGrid(ctx, sampleGrid, CANVAS_W, CANVAS_H, transform);
    expect(ctx.createImageData).toHaveBeenCalledWith(
      sampleGrid.width,
      sampleGrid.height
    );
  });

  it('maps -1 (unknown) to gray-blue color in image data', () => {
    // Build a 1×1 grid with a single unknown cell
    const unknownGrid: ParsedOccupancyGrid = {
      ...sampleGrid,
      width: 1,
      height: 1,
      cells: new Int8Array([-1]),
    };
    const imageData = {
      width: 1,
      height: 1,
      data: new Uint8ClampedArray(4),
    };
    const ctx = createMockContext();
    ctx.createImageData.mockReturnValueOnce(imageData);

    renderOccupancyGrid(ctx, unknownGrid, CANVAS_W, CANVAS_H, transform);

    const [r, g, b] = cellToColor(-1);
    expect(imageData.data[0]).toBe(r);
    expect(imageData.data[1]).toBe(g);
    expect(imageData.data[2]).toBe(b);
    expect(imageData.data[3]).toBe(255); // fully opaque
  });

  it('maps 0 (free) to near-black color in image data', () => {
    const freeGrid: ParsedOccupancyGrid = {
      ...sampleGrid,
      width: 1,
      height: 1,
      cells: new Int8Array([0]),
    };
    const imageData = {
      width: 1,
      height: 1,
      data: new Uint8ClampedArray(4),
    };
    const ctx = createMockContext();
    ctx.createImageData.mockReturnValueOnce(imageData);

    renderOccupancyGrid(ctx, freeGrid, CANVAS_W, CANVAS_H, transform);

    const [r, g, b] = cellToColor(0);
    expect(imageData.data[0]).toBe(r);
    expect(imageData.data[1]).toBe(g);
    expect(imageData.data[2]).toBe(b);
    expect(imageData.data[3]).toBe(255);
  });

  it('maps 100 (occupied) to light color in image data', () => {
    const occupiedGrid: ParsedOccupancyGrid = {
      ...sampleGrid,
      width: 1,
      height: 1,
      cells: new Int8Array([100]),
    };
    const imageData = {
      width: 1,
      height: 1,
      data: new Uint8ClampedArray(4),
    };
    const ctx = createMockContext();
    ctx.createImageData.mockReturnValueOnce(imageData);

    renderOccupancyGrid(ctx, occupiedGrid, CANVAS_W, CANVAS_H, transform);

    const [r, g, b] = cellToColor(100);
    expect(imageData.data[0]).toBe(r);
    expect(imageData.data[1]).toBe(g);
    expect(imageData.data[2]).toBe(b);
    expect(imageData.data[3]).toBe(255);
  });
});

// ---------------------------------------------------------------------------
// worldToGrid
// ---------------------------------------------------------------------------

describe('worldToGrid', () => {
  const grid: ParsedOccupancyGrid = {
    width: 100,
    height: 100,
    resolution: 0.1, // 0.1 m per cell
    originX: -5.0, // world X at col 0
    originY: -5.0, // world Y at row 0
    cells: new Int8Array(10000),
    timestamp: 0,
  };

  it('maps origin world coordinates to grid cell (0, 0)', () => {
    const result = worldToGrid(-5.0, -5.0, grid);
    expect(result.col).toBe(0);
    expect(result.row).toBe(0);
  });

  it('maps world coordinates correctly at a known offset', () => {
    // worldX = -5 + 5 * 0.1 = -4.5 → col 5
    // worldY = -5 + 3 * 0.1 = -4.7 → row 3
    // Use exact multiples to avoid floating-point truncation surprises.
    // col = (-4.5 - (-5.0)) / 0.1 = 0.5 / 0.1 = 5.0 → 5
    // row = (-4.7 - (-5.0)) / 0.1 = 0.3 / 0.1 = ~2.999 → floor = 2
    // Fix: use -4.6 so row = 0.4/0.1 = 4.0 → 4
    const result = worldToGrid(-4.5, -4.6, grid);
    expect(result.col).toBe(5);
    expect(result.row).toBe(4);
  });

  it('handles positive world coordinates', () => {
    // worldX = -5 + 80 * 0.1 = 3.0 → col 80
    // worldY = -5 + 60 * 0.1 = 1.0 → row 60
    const result = worldToGrid(3.0, 1.0, grid);
    expect(result.col).toBe(80);
    expect(result.row).toBe(60);
  });

  it('floors fractional grid positions to integer cells', () => {
    // worldX = -5 + 0.05 = -4.95 → fractional col 0.5 → floored to 0
    const result = worldToGrid(-4.95, -5.0, grid);
    expect(Number.isInteger(result.col)).toBe(true);
    expect(Number.isInteger(result.row)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// renderRobotMarker
// ---------------------------------------------------------------------------

describe('renderRobotMarker', () => {
  const grid: ParsedOccupancyGrid = {
    width: 100,
    height: 100,
    resolution: 0.1,
    originX: -5.0,
    originY: -5.0,
    cells: new Int8Array(10000),
    timestamp: 0,
  };

  const transform = { k: 1, x: 0, y: 0 };

  it('calls ctx.save and ctx.restore', () => {
    const ctx = createMockContext();
    renderRobotMarker(ctx, { x: 0, y: 0, heading: 0 }, grid, transform);
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('calls ctx.beginPath to start the triangle path', () => {
    const ctx = createMockContext();
    renderRobotMarker(ctx, { x: 0, y: 0, heading: 0 }, grid, transform);
    expect(ctx.beginPath).toHaveBeenCalled();
  });

  it('calls ctx.fill to paint the marker', () => {
    const ctx = createMockContext();
    renderRobotMarker(ctx, { x: 0, y: 0, heading: 0 }, grid, transform);
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('calls ctx.translate to position the marker at the robot location', () => {
    const ctx = createMockContext();
    renderRobotMarker(ctx, { x: 1.0, y: 1.0, heading: 0 }, grid, transform);
    expect(ctx.translate).toHaveBeenCalled();
  });

  it('calls ctx.rotate to orient the marker with the heading', () => {
    const ctx = createMockContext();
    renderRobotMarker(
      ctx,
      { x: 0, y: 0, heading: Math.PI / 4 },
      grid,
      transform
    );
    expect(ctx.rotate).toHaveBeenCalled();
  });
});
