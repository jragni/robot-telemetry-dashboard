import { renderHook, act } from '@testing-library/react';

import { useMinimizedPanels } from '../useMinimizedPanels';

const PANEL_IDS = ['map', 'imu', 'lidar', 'controls', 'battery', 'logs'] as const;

describe('useMinimizedPanels', () => {
  it('returns initial state with nothing minimized or maximized', () => {
    const { result } = renderHook(() => useMinimizedPanels(PANEL_IDS));

    expect(result.current.maximizedId).toBeNull();
    expect(result.current.minimizedIds.size).toBe(0);

    for (const id of PANEL_IDS) {
      expect(result.current.isMinimized(id)).toBe(false);
      expect(result.current.isMaximized(id)).toBe(false);
    }
  });

  it('minimize() adds a panel to the minimized set', () => {
    const { result } = renderHook(() => useMinimizedPanels(PANEL_IDS));

    act(() => {
      result.current.minimize('map');
    });

    expect(result.current.isMinimized('map')).toBe(true);
    expect(result.current.minimizedIds.has('map')).toBe(true);
    expect(result.current.isMinimized('imu')).toBe(false);
  });

  it('minimize() can add multiple panels', () => {
    const { result } = renderHook(() => useMinimizedPanels(PANEL_IDS));

    act(() => {
      result.current.minimize('map');
      result.current.minimize('lidar');
    });

    expect(result.current.isMinimized('map')).toBe(true);
    expect(result.current.isMinimized('lidar')).toBe(true);
    expect(result.current.minimizedIds.size).toBe(2);
  });

  it('restore() removes a panel from the minimized set', () => {
    const { result } = renderHook(() => useMinimizedPanels(PANEL_IDS));

    act(() => {
      result.current.minimize('map');
      result.current.minimize('imu');
    });

    act(() => {
      result.current.restore('map');
    });

    expect(result.current.isMinimized('map')).toBe(false);
    expect(result.current.isMinimized('imu')).toBe(true);
    expect(result.current.minimizedIds.size).toBe(1);
  });

  it('restore() on a non-minimized panel is a no-op', () => {
    const { result } = renderHook(() => useMinimizedPanels(PANEL_IDS));

    act(() => {
      result.current.restore('map');
    });

    expect(result.current.minimizedIds.size).toBe(0);
  });

  it('maximize() sets the panel as maximized and minimizes all others', () => {
    const { result } = renderHook(() => useMinimizedPanels(PANEL_IDS));

    act(() => {
      result.current.maximize('imu');
    });

    expect(result.current.isMaximized('imu')).toBe(true);
    expect(result.current.maximizedId).toBe('imu');
    expect(result.current.isMinimized('imu')).toBe(false);

    const otherIds = PANEL_IDS.filter((id) => id !== 'imu');
    for (const id of otherIds) {
      expect(result.current.isMinimized(id)).toBe(true);
      expect(result.current.isMaximized(id)).toBe(false);
    }
  });

  it('maximize() switches maximized panel when called again', () => {
    const { result } = renderHook(() => useMinimizedPanels(PANEL_IDS));

    act(() => {
      result.current.maximize('imu');
    });

    act(() => {
      result.current.maximize('map');
    });

    expect(result.current.isMaximized('map')).toBe(true);
    expect(result.current.isMaximized('imu')).toBe(false);
    expect(result.current.isMinimized('imu')).toBe(true);
    expect(result.current.isMinimized('map')).toBe(false);
  });

  it('restoreAll() clears all minimized and maximized state', () => {
    const { result } = renderHook(() => useMinimizedPanels(PANEL_IDS));

    act(() => {
      result.current.maximize('lidar');
    });

    act(() => {
      result.current.restoreAll();
    });

    expect(result.current.maximizedId).toBeNull();
    expect(result.current.minimizedIds.size).toBe(0);

    for (const id of PANEL_IDS) {
      expect(result.current.isMinimized(id)).toBe(false);
      expect(result.current.isMaximized(id)).toBe(false);
    }
  });

  it('minimize() clears maximized state', () => {
    const { result } = renderHook(() => useMinimizedPanels(PANEL_IDS));

    act(() => {
      result.current.maximize('imu');
    });

    act(() => {
      result.current.minimize('map');
    });

    expect(result.current.maximizedId).toBeNull();
    expect(result.current.isMinimized('map')).toBe(true);
  });

  it('restore() clears maximized state', () => {
    const { result } = renderHook(() => useMinimizedPanels(PANEL_IDS));

    act(() => {
      result.current.maximize('imu');
    });

    act(() => {
      result.current.restore('map');
    });

    expect(result.current.maximizedId).toBeNull();
    expect(result.current.isMinimized('map')).toBe(false);
  });
});
