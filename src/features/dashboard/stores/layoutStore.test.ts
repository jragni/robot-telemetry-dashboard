import { act } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { DEFAULT_LAYOUTS } from '../registry/defaultLayouts';

import { useLayoutStore } from './layoutStore';

const LS_KEYS = {
  dashboard: 'rdt-layout-dashboard',
  pilot: 'rdt-layout-pilot',
  engineer: 'rdt-layout-engineer',
} as const;

describe('useLayoutStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useLayoutStore.setState({
      layouts: {
        dashboard: DEFAULT_LAYOUTS.dashboard,
        pilot: DEFAULT_LAYOUTS.pilot,
        engineer: DEFAULT_LAYOUTS.engineer,
      },
    });
    // Reset the skipNextSaveRef
    useLayoutStore.getState().skipNextSaveRef.current = false;
  });

  // ── getLayout ────────────────────────────────────────────────────────────

  it('getLayout returns the default layout for a mode before any save', () => {
    const layout = useLayoutStore.getState().getLayout('dashboard');
    expect(layout).toEqual(DEFAULT_LAYOUTS.dashboard);
  });

  it('getLayout returns stored layout for all three modes', () => {
    for (const mode of ['dashboard', 'pilot', 'engineer'] as const) {
      expect(useLayoutStore.getState().getLayout(mode)).toBeDefined();
      expect(Array.isArray(useLayoutStore.getState().getLayout(mode))).toBe(
        true
      );
    }
  });

  // ── saveLayout ───────────────────────────────────────────────────────────

  it('saveLayout persists to localStorage under the correct key', () => {
    const newLayout = [{ i: 'map', x: 0, y: 0, w: 12, h: 8 }];
    useLayoutStore.getState().saveLayout('dashboard', newLayout);

    const stored = JSON.parse(
      localStorage.getItem(LS_KEYS.dashboard) ?? 'null'
    );
    expect(stored).toEqual(newLayout);
  });

  it('saveLayout updates the in-memory layout', () => {
    const newLayout = [{ i: 'video', x: 0, y: 0, w: 12, h: 8 }];
    useLayoutStore.getState().saveLayout('pilot', newLayout);
    expect(useLayoutStore.getState().getLayout('pilot')).toEqual(newLayout);
  });

  it('saveLayout is a no-op when skipNextSaveRef is true, then clears the flag', () => {
    const originalLayout = useLayoutStore.getState().getLayout('pilot');
    useLayoutStore.getState().skipNextSaveRef.current = true;

    const newLayout = [{ i: 'video', x: 0, y: 0, w: 12, h: 8 }];
    useLayoutStore.getState().saveLayout('pilot', newLayout);

    // Layout should be unchanged
    expect(useLayoutStore.getState().getLayout('pilot')).toEqual(
      originalLayout
    );
    // localStorage should not be updated
    expect(localStorage.getItem(LS_KEYS.pilot)).toBeNull();
    // Flag should be cleared
    expect(useLayoutStore.getState().skipNextSaveRef.current).toBe(false);
  });

  it('saveLayout after skipNextSaveRef clears: subsequent saves work normally', () => {
    useLayoutStore.getState().skipNextSaveRef.current = true;
    const ignored = [{ i: 'ignored', x: 0, y: 0, w: 1, h: 1 }];
    useLayoutStore.getState().saveLayout('pilot', ignored);
    // flag is now cleared; next save should work
    const real = [{ i: 'video', x: 0, y: 0, w: 12, h: 8 }];
    useLayoutStore.getState().saveLayout('pilot', real);
    expect(useLayoutStore.getState().getLayout('pilot')).toEqual(real);
    expect(JSON.parse(localStorage.getItem(LS_KEYS.pilot) ?? 'null')).toEqual(
      real
    );
  });

  // ── resetLayout ──────────────────────────────────────────────────────────

  it('resetLayout restores the default layout in memory', () => {
    const custom = [{ i: 'map', x: 5, y: 5, w: 2, h: 2 }];
    useLayoutStore.getState().saveLayout('dashboard', custom);
    useLayoutStore.getState().resetLayout('dashboard');
    expect(useLayoutStore.getState().getLayout('dashboard')).toEqual(
      DEFAULT_LAYOUTS.dashboard
    );
  });

  it('resetLayout writes default layout to localStorage', () => {
    const custom = [{ i: 'map', x: 5, y: 5, w: 2, h: 2 }];
    useLayoutStore.getState().saveLayout('dashboard', custom);
    useLayoutStore.getState().resetLayout('dashboard');

    const stored = JSON.parse(
      localStorage.getItem(LS_KEYS.dashboard) ?? 'null'
    );
    expect(stored).toEqual(DEFAULT_LAYOUTS.dashboard);
  });

  it('resetLayout sets skipNextSaveRef.current = true', () => {
    useLayoutStore.getState().resetLayout('pilot');
    expect(useLayoutStore.getState().skipNextSaveRef.current).toBe(true);
  });

  it('onLayoutChange race guard: resetLayout → saveLayout skips, localStorage retains default', () => {
    // Simulate what react-grid-layout does: fires onLayoutChange immediately after layout reset
    useLayoutStore.getState().resetLayout('pilot');

    // This is the stale onLayoutChange callback that fires right after reset
    const staleLayout = [{ i: 'stale', x: 9, y: 9, w: 1, h: 1 }];
    useLayoutStore.getState().saveLayout('pilot', staleLayout);

    // localStorage should still have the default, not the stale layout
    const stored = JSON.parse(localStorage.getItem(LS_KEYS.pilot) ?? 'null');
    expect(stored).toEqual(DEFAULT_LAYOUTS.pilot);
    // In-memory layout should also be default
    expect(useLayoutStore.getState().getLayout('pilot')).toEqual(
      DEFAULT_LAYOUTS.pilot
    );
  });

  // ── localStorage init / hydration ────────────────────────────────────────

  it('init: falls back to default on malformed JSON in localStorage', () => {
    localStorage.setItem(LS_KEYS.engineer, 'NOT_VALID_JSON{{{');
    // Trigger re-hydration by calling the store's hydrate action
    useLayoutStore.getState().hydrateFromStorage();
    expect(useLayoutStore.getState().getLayout('engineer')).toEqual(
      DEFAULT_LAYOUTS.engineer
    );
  });

  it('init: falls back to default when panel id does not match registry', () => {
    const brokenLayout = JSON.stringify([
      { i: 'unknown-widget-v99', x: 0, y: 0, w: 4, h: 4 },
    ]);
    localStorage.setItem(LS_KEYS.dashboard, brokenLayout);
    useLayoutStore.getState().hydrateFromStorage();
    expect(useLayoutStore.getState().getLayout('dashboard')).toEqual(
      DEFAULT_LAYOUTS.dashboard
    );
  });

  it('init: loads valid layout from localStorage', () => {
    const savedLayout = DEFAULT_LAYOUTS.dashboard.map((item) => ({
      ...item,
      w: item.w + 1,
    }));
    localStorage.setItem(LS_KEYS.dashboard, JSON.stringify(savedLayout));
    useLayoutStore.getState().hydrateFromStorage();
    expect(useLayoutStore.getState().getLayout('dashboard')).toEqual(
      savedLayout
    );
  });

  // ── skipNextSaveRef is a ref, not state ──────────────────────────────────

  it('skipNextSaveRef is a MutableRefObject (not reactive state)', () => {
    const ref = useLayoutStore.getState().skipNextSaveRef;
    expect(ref).toBeDefined();
    expect(typeof ref).toBe('object');
    expect('current' in ref).toBe(true);
  });
});
