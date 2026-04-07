import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useZoom } from './useZoom';

const DEFAULT_CONFIG = { min: 0.5, max: 4, step: 0.2 };

describe('useZoom', () => {
  it('defaults initial zoom to 1', () => {
    const { result } = renderHook(() => useZoom(DEFAULT_CONFIG));
    expect(result.current.zoom).toBe(1);
  });

  it('uses provided initial value', () => {
    const { result } = renderHook(() => useZoom({ ...DEFAULT_CONFIG, initial: 2 }));
    expect(result.current.zoom).toBe(2);
  });

  it('zoomIn increases by step', () => {
    const { result } = renderHook(() => useZoom(DEFAULT_CONFIG));
    act(() => {
      result.current.zoomIn();
    });
    expect(result.current.zoom).toBeCloseTo(1.2);
  });

  it('zoomIn clamps at max', () => {
    const { result } = renderHook(() => useZoom({ ...DEFAULT_CONFIG, initial: 3.9 }));
    act(() => {
      result.current.zoomIn();
    });
    expect(result.current.zoom).toBe(4);
  });

  it('zoomOut decreases by step', () => {
    const { result } = renderHook(() => useZoom(DEFAULT_CONFIG));
    act(() => {
      result.current.zoomOut();
    });
    expect(result.current.zoom).toBeCloseTo(0.8);
  });

  it('zoomOut clamps at min', () => {
    const { result } = renderHook(() => useZoom({ ...DEFAULT_CONFIG, initial: 0.6 }));
    act(() => {
      result.current.zoomOut();
    });
    expect(result.current.zoom).toBe(0.5);
  });

  it('handleWheel with positive deltaY zooms out', () => {
    const { result } = renderHook(() => useZoom(DEFAULT_CONFIG));
    act(() => {
      result.current.handleWheel({
        deltaY: 100,
        preventDefault: vi.fn(),
      } as unknown as React.WheelEvent);
    });
    expect(result.current.zoom).toBeCloseTo(0.8);
  });

  it('handleWheel with negative deltaY zooms in', () => {
    const { result } = renderHook(() => useZoom(DEFAULT_CONFIG));
    act(() => {
      result.current.handleWheel({
        deltaY: -100,
        preventDefault: vi.fn(),
      } as unknown as React.WheelEvent);
    });
    expect(result.current.zoom).toBeCloseTo(1.2);
  });
});
