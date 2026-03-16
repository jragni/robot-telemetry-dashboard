import type { ColormapPreset } from './depth-camera.types';

// ---------------------------------------------------------------------------
// Viridis lookup table (sampled at 11 control points, 0..1)
// Values sourced from the matplotlib viridis colormap.
// ---------------------------------------------------------------------------

const VIRIDIS_LUT: [number, number, number][] = [
  [68, 1, 84],
  [72, 40, 120],
  [62, 74, 137],
  [49, 104, 142],
  [38, 130, 142],
  [31, 158, 137],
  [53, 183, 121],
  [110, 206, 88],
  [181, 222, 43],
  [253, 231, 37],
  [253, 231, 37], // duplicate end to simplify boundary arithmetic
];

/**
 * Linear interpolation between two 0-255 integers.
 */
function lerp8(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

/**
 * Maps a normalized depth value [0, 1] to an RGB triple using the requested
 * colormap preset.
 *
 * - heat:      0 = red (#ff0000), 0.5 = green (#00ff00), 1 = blue (#0000ff)
 * - grayscale: 0 = black (#000000), 1 = white (#ffffff)
 * - viridis:   standard matplotlib viridis perceptual colormap
 *
 * Input is clamped to [0, 1] before mapping.
 */
export function depthToRgb(
  normalized: number,
  preset: ColormapPreset
): [number, number, number] {
  const t = Math.max(0, Math.min(1, normalized));

  switch (preset) {
    case 'grayscale': {
      const v = Math.round(t * 255);
      return [v, v, v];
    }

    case 'viridis': {
      // Map t → index into the LUT
      const maxIdx = VIRIDIS_LUT.length - 2; // last interpolatable segment
      const scaled = t * maxIdx;
      const lo = Math.floor(scaled);
      const hi = Math.min(lo + 1, VIRIDIS_LUT.length - 1);
      const frac = scaled - lo;

      const [r0, g0, b0] = VIRIDIS_LUT[lo];
      const [r1, g1, b1] = VIRIDIS_LUT[hi];

      return [lerp8(r0, r1, frac), lerp8(g0, g1, frac), lerp8(b0, b1, frac)];
    }

    case 'heat':
    default: {
      // Piecewise linear: red → green (0..0.5) then green → blue (0.5..1)
      if (t <= 0.5) {
        const s = t / 0.5; // 0..1
        const r = Math.round(255 * (1 - s));
        const g = Math.round(255 * s);
        return [r, g, 0];
      } else {
        const s = (t - 0.5) / 0.5; // 0..1
        const g = Math.round(255 * (1 - s));
        const b = Math.round(255 * s);
        return [0, g, b];
      }
    }
  }
}
