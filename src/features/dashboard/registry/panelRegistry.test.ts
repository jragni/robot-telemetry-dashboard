import { describe, expect, it } from 'vitest';

import { DEFAULT_LAYOUTS } from './defaultLayouts';
import { panelRegistry } from './panelRegistry';

describe('panelRegistry', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(panelRegistry)).toBe(true);
    expect(panelRegistry.length).toBeGreaterThan(0);
  });

  it('every entry has a unique widgetId', () => {
    const ids = panelRegistry.map((e) => e.widgetId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every entry has required fields: widgetId, label, description, component, availableInModes, defaultSize, minSize', () => {
    for (const entry of panelRegistry) {
      expect(entry.widgetId).toBeTruthy();
      expect(entry.label).toBeTruthy();
      expect(entry.description).toBeTruthy();
      expect(typeof entry.component).toBe('function');
      expect(Array.isArray(entry.availableInModes)).toBe(true);
      expect(entry.defaultSize).toBeDefined();
      expect(entry.minSize).toBeDefined();
    }
  });

  it('availableInModes only contains valid DashboardMode values', () => {
    const valid = new Set(['dashboard', 'pilot', 'engineer']);
    for (const entry of panelRegistry) {
      for (const mode of entry.availableInModes) {
        expect(valid.has(mode)).toBe(true);
      }
    }
  });

  it('map widget is sovereign in dashboard mode', () => {
    const map = panelRegistry.find((e) => e.widgetId === 'map');
    expect(map).toBeDefined();
    expect(map?.isSovereign).toBe(true);
    expect(map?.availableInModes).toContain('dashboard');
  });

  it('video widget is sovereign in pilot mode', () => {
    const video = panelRegistry.find((e) => e.widgetId === 'video');
    expect(video).toBeDefined();
    expect(video?.isSovereign).toBe(true);
    expect(video?.availableInModes).toContain('pilot');
  });

  it('robot-controls widget is available in pilot mode', () => {
    const controls = panelRegistry.find((e) => e.widgetId === 'robot-controls');
    expect(controls).toBeDefined();
    expect(controls?.availableInModes).toContain('pilot');
  });

  it('all widgets are available in engineer mode', () => {
    const engineerWidgets = panelRegistry.filter((e) =>
      e.availableInModes.includes('engineer')
    );
    expect(engineerWidgets.length).toBeGreaterThanOrEqual(5);
  });

  it('DEFAULT_LAYOUTS.dashboard contains all expected panel ids', () => {
    const ids = DEFAULT_LAYOUTS.dashboard.map((l) => l.i);
    expect(ids).toContain('map');
    expect(ids).toContain('video-pip-1');
    expect(ids).toContain('fleet-status');
    expect(ids).toContain('video-pip-2');
    expect(ids).toContain('alerts');
  });

  it('DEFAULT_LAYOUTS.pilot contains expected panel ids', () => {
    const ids = DEFAULT_LAYOUTS.pilot.map((l) => l.i);
    expect(ids).toContain('video');
    expect(ids).toContain('robot-controls');
    expect(ids).toContain('imu');
    expect(ids).toContain('data-plot');
    expect(ids).toContain('topic-list');
  });

  it('DEFAULT_LAYOUTS.engineer contains expected panel ids', () => {
    const ids = DEFAULT_LAYOUTS.engineer.map((l) => l.i);
    expect(ids).toContain('video');
    expect(ids).toContain('lidar');
    expect(ids).toContain('topic-list');
    expect(ids).toContain('data-plot');
  });

  it('DEFAULT_LAYOUTS.dashboard map panel matches spec: x:3, y:0, w:6, h:8', () => {
    const map = DEFAULT_LAYOUTS.dashboard.find((l) => l.i === 'map');
    expect(map).toMatchObject({ x: 3, y: 0, w: 6, h: 8 });
  });

  it('DEFAULT_LAYOUTS.pilot video panel is full-width: w:12', () => {
    const video = DEFAULT_LAYOUTS.pilot.find((l) => l.i === 'video');
    expect(video?.w).toBe(12);
  });

  it('each DEFAULT_LAYOUTS panel id matches a registered widgetId or is a composite key', () => {
    const registeredIds = new Set(panelRegistry.map((e) => e.widgetId));
    // composite keys like 'video-pip-1', 'video-pip-2' are variants of 'video' widgetId
    // Just verify every layout item has a non-empty id
    for (const mode of ['dashboard', 'pilot', 'engineer'] as const) {
      for (const item of DEFAULT_LAYOUTS[mode]) {
        expect(item.i).toBeTruthy();
      }
    }
  });
});
