import { describe, it, expect } from 'vitest';

import { depthToRgb } from './depth-camera.utils';

// ---------------------------------------------------------------------------
// depthToRgb
// ---------------------------------------------------------------------------

describe('depthToRgb', () => {
  // -------------------------------------------------------------------------
  // heat colormap
  // -------------------------------------------------------------------------

  describe('heat colormap', () => {
    it('maps 0 (near) to red [255, 0, 0]', () => {
      expect(depthToRgb(0, 'heat')).toEqual([255, 0, 0]);
    });

    it('maps 1 (far) to blue [0, 0, 255]', () => {
      expect(depthToRgb(1, 'heat')).toEqual([0, 0, 255]);
    });

    it('maps 0.5 to the midpoint (green channel dominant)', () => {
      const [r, g, b] = depthToRgb(0.5, 'heat');
      // At midpoint the green channel should be maximal and r/b should be equal
      expect(g).toBe(255);
      expect(r).toBe(b);
    });

    it('clamps values below 0 to the minimum', () => {
      expect(depthToRgb(-0.5, 'heat')).toEqual([255, 0, 0]);
    });

    it('clamps values above 1 to the maximum', () => {
      expect(depthToRgb(1.5, 'heat')).toEqual([0, 0, 255]);
    });
  });

  // -------------------------------------------------------------------------
  // grayscale colormap
  // -------------------------------------------------------------------------

  describe('grayscale colormap', () => {
    it('maps 0 (near) to black [0, 0, 0]', () => {
      expect(depthToRgb(0, 'grayscale')).toEqual([0, 0, 0]);
    });

    it('maps 1 (far) to white [255, 255, 255]', () => {
      expect(depthToRgb(1, 'grayscale')).toEqual([255, 255, 255]);
    });

    it('maps 0.5 to mid-gray [127, 127, 127] or [128, 128, 128]', () => {
      const [r, g, b] = depthToRgb(0.5, 'grayscale');
      expect(r).toBe(g);
      expect(g).toBe(b);
      expect(r).toBeGreaterThanOrEqual(127);
      expect(r).toBeLessThanOrEqual(128);
    });

    it('clamps values below 0 to black', () => {
      expect(depthToRgb(-1, 'grayscale')).toEqual([0, 0, 0]);
    });

    it('clamps values above 1 to white', () => {
      expect(depthToRgb(2, 'grayscale')).toEqual([255, 255, 255]);
    });
  });

  // -------------------------------------------------------------------------
  // viridis colormap
  // -------------------------------------------------------------------------

  describe('viridis colormap', () => {
    it('returns a valid RGB triple for 0', () => {
      const rgb = depthToRgb(0, 'viridis');
      expect(rgb).toHaveLength(3);
      rgb.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(255);
      });
    });

    it('returns a valid RGB triple for 1', () => {
      const rgb = depthToRgb(1, 'viridis');
      expect(rgb).toHaveLength(3);
      rgb.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(255);
      });
    });

    it('returns a valid RGB triple for 0.5', () => {
      const rgb = depthToRgb(0.5, 'viridis');
      expect(rgb).toHaveLength(3);
      rgb.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(255);
      });
    });

    it('produces different values at 0 and 1', () => {
      const at0 = depthToRgb(0, 'viridis');
      const at1 = depthToRgb(1, 'viridis');
      expect(at0).not.toEqual(at1);
    });
  });
});
