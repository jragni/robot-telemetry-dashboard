import { describe, it, expect, vi } from 'vitest';

import type { LidarRenderData } from './lidar.types';
import { transformLaserScan, renderLidarFrame } from './lidar.utils';

import type { LaserScanMessage } from '@/types/ros-messages';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface MockContext extends CanvasRenderingContext2D {
  clearRect: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  arc: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  translate: ReturnType<typeof vi.fn>;
  scale: ReturnType<typeof vi.fn>;
}

function createMockContext(): MockContext {
  return {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    set fillStyle(_: string) {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    set strokeStyle(_: string) {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    set lineWidth(_: number) {},
  } as unknown as MockContext;
}

/**
 * Builds a minimal LaserScanMessage with sensible defaults.
 * Individual properties can be overridden via the partial argument.
 */
function buildScan(
  overrides: Partial<LaserScanMessage> = {}
): LaserScanMessage {
  return {
    header: {
      stamp: { sec: 1000, nsec: 0 },
      frame_id: 'laser',
    },
    angle_min: 0,
    angle_max: Math.PI,
    angle_increment: Math.PI / 4, // 45° steps → 5 readings covering 0..π
    time_increment: 0,
    scan_time: 0.1,
    range_min: 0.1,
    range_max: 10.0,
    ranges: [1, 2, 3, 4, 5], // 5 valid readings
    intensities: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// transformLaserScan
// ---------------------------------------------------------------------------

describe('transformLaserScan', () => {
  it('produces correct point count for valid ranges', () => {
    const msg = buildScan({ ranges: [1, 2, 3, 4, 5] });
    const result = transformLaserScan(msg);
    expect(result.points).toHaveLength(5);
  });

  it('converts polar to Cartesian correctly for a known angle and range', () => {
    // angle_min = 0, angle_increment = π/2, one range of 1.0
    // angle at index 0 = 0 rad  → x = cos(0)*1 = 1,  y = sin(0)*1 = 0
    // angle at index 1 = π/2   → x = cos(π/2)*1 ≈ 0, y = sin(π/2)*1 = 1
    const msg = buildScan({
      angle_min: 0,
      angle_increment: Math.PI / 2,
      ranges: [1.0, 1.0],
    });
    const result = transformLaserScan(msg);

    expect(result.points[0].x).toBeCloseTo(1.0, 5);
    expect(result.points[0].y).toBeCloseTo(0.0, 5);
    expect(result.points[1].x).toBeCloseTo(0.0, 5);
    expect(result.points[1].y).toBeCloseTo(1.0, 5);
  });

  it('filters out Infinity values', () => {
    const msg = buildScan({ ranges: [1, Infinity, 2, -Infinity, 3] });
    const result = transformLaserScan(msg);
    expect(result.points).toHaveLength(3);
  });

  it('filters values below range_min', () => {
    const msg = buildScan({
      range_min: 0.5,
      range_max: 10.0,
      ranges: [0.1, 0.4, 1.0, 2.0], // first two below range_min
    });
    const result = transformLaserScan(msg);
    expect(result.points).toHaveLength(2);
  });

  it('filters values above range_max', () => {
    const msg = buildScan({
      range_min: 0.1,
      range_max: 5.0,
      ranges: [1.0, 5.1, 10.0, 3.0], // second and third above range_max
    });
    const result = transformLaserScan(msg);
    expect(result.points).toHaveLength(2);
  });

  it('filters values outside [range_min, range_max] (combined)', () => {
    const msg = buildScan({
      range_min: 1.0,
      range_max: 8.0,
      ranges: [0.5, 1.0, 5.0, 8.0, 8.5, Infinity],
    });
    const result = transformLaserScan(msg);
    // 1.0 and 5.0 and 8.0 pass; 0.5, 8.5, Infinity are filtered
    expect(result.points).toHaveLength(3);
  });

  it('returns empty points and maxRange 0 for empty ranges array', () => {
    const msg = buildScan({ ranges: [] });
    const result = transformLaserScan(msg);
    expect(result.points).toEqual([]);
    expect(result.maxRange).toBe(0);
  });

  it('returns correct maxRange as the largest valid range', () => {
    const msg = buildScan({ ranges: [1, 3, 2, Infinity] }); // max valid = 3
    const result = transformLaserScan(msg);
    expect(result.maxRange).toBeCloseTo(3, 5);
  });

  it('populates frameId and timestamp from header', () => {
    const msg = buildScan({
      header: { stamp: { sec: 42, nsec: 500000000 }, frame_id: 'base_laser' },
    });
    const result = transformLaserScan(msg);
    expect(result.frameId).toBe('base_laser');
    // timestamp = sec * 1000 + nsec / 1_000_000
    expect(result.timestamp).toBeCloseTo(42500, 0);
  });

  it('exposes rangeMin and rangeMax from the message', () => {
    const msg = buildScan({ range_min: 0.2, range_max: 12.0 });
    const result = transformLaserScan(msg);
    expect(result.rangeMin).toBe(0.2);
    expect(result.rangeMax).toBe(12.0);
  });
});

// ---------------------------------------------------------------------------
// renderLidarFrame
// ---------------------------------------------------------------------------

describe('renderLidarFrame', () => {
  const WIDTH = 400;
  const HEIGHT = 400;
  const SCALE = 50; // px per metre

  const sampleData: LidarRenderData = {
    points: [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ],
    maxRange: 5,
    frameId: 'laser',
    timestamp: 1000,
    rangeMin: 0.1,
    rangeMax: 5.0,
  };

  it('calls ctx.clearRect to clear the canvas', () => {
    const ctx = createMockContext();
    renderLidarFrame(ctx, sampleData, WIDTH, HEIGHT, SCALE);
    expect(ctx.clearRect).toHaveBeenCalledOnce();
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, WIDTH, HEIGHT);
  });

  it('draws one arc call per scan point', () => {
    const ctx = createMockContext();
    renderLidarFrame(ctx, sampleData, WIDTH, HEIGHT, SCALE);

    // Each scan point should produce at least one arc call.
    // The robot origin marker also calls arc, so total >= points.length + 1.
    const arcCallCount = ctx.arc.mock.calls.length;
    expect(arcCallCount).toBeGreaterThanOrEqual(sampleData.points.length);
  });

  it('draws the correct number of scan points', () => {
    const ctx = createMockContext();

    const threePointData: LidarRenderData = {
      ...sampleData,
      points: [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ],
    };
    renderLidarFrame(ctx, threePointData, WIDTH, HEIGHT, SCALE);

    const twoPointData: LidarRenderData = {
      ...sampleData,
      points: [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
    };
    const ctx2 = createMockContext();
    renderLidarFrame(ctx2, twoPointData, WIDTH, HEIGHT, SCALE);

    const arcDiff = ctx.arc.mock.calls.length - ctx2.arc.mock.calls.length;

    // Exactly one extra arc call for the extra scan point.
    expect(arcDiff).toBe(1);
  });

  it('draws the robot origin marker (at least one arc call exists even with no points)', () => {
    const ctx = createMockContext();
    const emptyData: LidarRenderData = {
      ...sampleData,
      points: [],
    };
    renderLidarFrame(ctx, emptyData, WIDTH, HEIGHT, SCALE);
    const arcCallCount = ctx.arc.mock.calls.length;
    expect(arcCallCount).toBeGreaterThanOrEqual(1);
  });

  it('calls ctx.save and ctx.restore for coordinate system setup', () => {
    const ctx = createMockContext();
    renderLidarFrame(ctx, sampleData, WIDTH, HEIGHT, SCALE);
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });
});
