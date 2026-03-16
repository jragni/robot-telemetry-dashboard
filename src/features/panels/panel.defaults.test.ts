import { describe, it, expect } from 'vitest';

import { DEFAULT_LAYOUTS, createDefaultLayout } from './panel.defaults';
import { PANEL_REGISTRY } from './panel.registry';
import type { ViewId, GridItemLayout } from './panel.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VIEW_IDS: ViewId[] = ['dashboard', 'fleet', 'map', 'pilot'];

/**
 * Returns true when two grid items overlap on the lg breakpoint.
 * Items are represented as axis-aligned rectangles: [x, x+w) × [y, y+h).
 */
function itemsOverlap(a: GridItemLayout, b: GridItemLayout): boolean {
  const xOverlap = a.x < b.x + b.w && a.x + a.w > b.x;
  const yOverlap = a.y < b.y + b.h && a.y + a.h > b.y;
  return xOverlap && yOverlap;
}

// ---------------------------------------------------------------------------
// DEFAULT_LAYOUTS structure
// ---------------------------------------------------------------------------

describe('DEFAULT_LAYOUTS', () => {
  it('has an entry for every ViewId', () => {
    for (const viewId of VIEW_IDS) {
      expect(
        DEFAULT_LAYOUTS,
        `Expected DEFAULT_LAYOUTS to have key "${viewId}"`
      ).toHaveProperty(viewId);
    }
  });

  it('has a non-empty panels array for each view', () => {
    for (const viewId of VIEW_IDS) {
      const { panels } = DEFAULT_LAYOUTS[viewId];
      expect(
        panels.length,
        `"${viewId}" panels array should not be empty`
      ).toBeGreaterThan(0);
    }
  });

  it('every panel instance has a typeId registered in PANEL_REGISTRY', () => {
    for (const viewId of VIEW_IDS) {
      const { panels } = DEFAULT_LAYOUTS[viewId];
      for (const panel of panels) {
        expect(
          Object.keys(PANEL_REGISTRY),
          `Panel type "${panel.type}" in view "${viewId}" is not in PANEL_REGISTRY`
        ).toContain(panel.type);
      }
    }
  });

  it('every GridItemLayout.i in lg breakpoint matches a panel instance id', () => {
    for (const viewId of VIEW_IDS) {
      const { breakpoints, panels } = DEFAULT_LAYOUTS[viewId];
      const panelIds = new Set(panels.map((p) => p.id));

      for (const item of breakpoints.lg) {
        expect(
          panelIds,
          `Layout item "${item.i}" in view "${viewId}" lg has no matching panel instance`
        ).toContain(item.i);
      }
    }
  });

  it('has no coordinate overlaps in the lg breakpoint for any view', () => {
    for (const viewId of VIEW_IDS) {
      const items = DEFAULT_LAYOUTS[viewId].breakpoints.lg;
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i];
          const b = items[j];
          expect(
            itemsOverlap(a, b),
            `Overlap detected between "${a.i}" and "${b.i}" in view "${viewId}" lg`
          ).toBe(false);
        }
      }
    }
  });

  it('every GridItemLayout.i in md breakpoint matches a panel instance id', () => {
    for (const viewId of VIEW_IDS) {
      const { breakpoints, panels } = DEFAULT_LAYOUTS[viewId];
      const panelIds = new Set(panels.map((p) => p.id));

      for (const item of breakpoints.md) {
        expect(
          panelIds,
          `Layout item "${item.i}" in view "${viewId}" md has no matching panel instance`
        ).toContain(item.i);
      }
    }
  });

  it('every GridItemLayout.i in sm breakpoint matches a panel instance id', () => {
    for (const viewId of VIEW_IDS) {
      const { breakpoints, panels } = DEFAULT_LAYOUTS[viewId];
      const panelIds = new Set(panels.map((p) => p.id));

      for (const item of breakpoints.sm) {
        expect(
          panelIds,
          `Layout item "${item.i}" in view "${viewId}" sm has no matching panel instance`
        ).toContain(item.i);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// createDefaultLayout
// ---------------------------------------------------------------------------

describe('createDefaultLayout', () => {
  it('returns a layout object equal in shape to the corresponding DEFAULT_LAYOUTS entry', () => {
    for (const viewId of VIEW_IDS) {
      const result = createDefaultLayout(viewId);
      expect(result).toEqual(DEFAULT_LAYOUTS[viewId]);
    }
  });

  it('returns a deep copy — mutating the copy does not affect DEFAULT_LAYOUTS', () => {
    for (const viewId of VIEW_IDS) {
      const copy = createDefaultLayout(viewId);
      const originalPanelCount = DEFAULT_LAYOUTS[viewId].panels.length;

      // Push a dummy panel onto the copy.
      copy.panels.push({ id: '__test__', type: 'data-plot' });

      expect(
        DEFAULT_LAYOUTS[viewId].panels.length,
        `Mutating the copy for "${viewId}" should not affect DEFAULT_LAYOUTS`
      ).toBe(originalPanelCount);
    }
  });

  it('returns a deep copy — mutating a nested layout item does not affect DEFAULT_LAYOUTS', () => {
    for (const viewId of VIEW_IDS) {
      const copy = createDefaultLayout(viewId);
      const firstItem = copy.breakpoints.lg[0];
      const originalX = DEFAULT_LAYOUTS[viewId].breakpoints.lg[0].x;

      firstItem.x = originalX + 999;

      expect(
        DEFAULT_LAYOUTS[viewId].breakpoints.lg[0].x,
        `Mutating a nested layout item copy for "${viewId}" should not affect DEFAULT_LAYOUTS`
      ).toBe(originalX);
    }
  });
});
