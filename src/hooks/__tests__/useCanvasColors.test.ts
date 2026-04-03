import { createRef } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useCanvasColors } from '../useCanvasColors';

const TOKEN_MAP = {
  accent: '--color-accent',
  border: '--color-border',
  textPrimary: '--color-text-primary',
} as const;

describe('useCanvasColors', () => {
  beforeEach(() => {
    document.documentElement.style.setProperty('--color-accent', 'oklch(0.7 0.2 230)');
    document.documentElement.style.setProperty('--color-border', 'oklch(0.38 0.02 260)');
    document.documentElement.style.setProperty('--color-text-primary', 'oklch(0.93 0.01 260)');
  });

  it('returns color object with correct keys', () => {
    const { result } = renderHook(() => useCanvasColors(TOKEN_MAP));
    expect(Object.keys(result.current.colors)).toEqual(['accent', 'border', 'textPrimary']);
  });

  it('resolves CSS custom properties from document.documentElement', () => {
    const { result } = renderHook(() => useCanvasColors(TOKEN_MAP));
    expect(result.current.colors.accent).toBe('oklch(0.7 0.2 230)');
    expect(result.current.colors.border).toBe('oklch(0.38 0.02 260)');
    expect(result.current.colors.textPrimary).toBe('oklch(0.93 0.01 260)');
  });

  it('works without elementRef (uses document.documentElement)', () => {
    const { result } = renderHook(() => useCanvasColors(TOKEN_MAP));
    expect(result.current.colors.accent).toBe('oklch(0.7 0.2 230)');
    expect(result.current.themeVersion).toBe(0);
  });

  it('uses elementRef for resolution on theme change', async () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    el.style.setProperty('--color-accent', 'oklch(0.9 0.1 100)');
    el.style.setProperty('--color-border', 'oklch(0.5 0.05 200)');
    el.style.setProperty('--color-text-primary', 'oklch(0.8 0.01 300)');

    const ref = createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement>;
    Object.defineProperty(ref, 'current', { value: el, writable: true });

    const { result } = renderHook(() => useCanvasColors(TOKEN_MAP, ref));

    // Initial render uses elementRef.current (non-null)
    expect(result.current.colors.accent).toBe('oklch(0.9 0.1 100)');

    // After theme change, elementRef is used for resolution
    await act(async () => {
      document.documentElement.setAttribute('data-theme', 'custom');
      await new Promise((resolve) => { setTimeout(resolve, 0); });
    });

    expect(result.current.colors.accent).toBe('oklch(0.9 0.1 100)');

    document.body.removeChild(el);
  });

  it('falls back to document.documentElement when elementRef.current is null', () => {
    const ref = createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement>;
    // ref.current is null by default (simulates pre-mount state)
    const { result } = renderHook(() => useCanvasColors(TOKEN_MAP, ref));
    expect(result.current.colors.accent).toBe('oklch(0.7 0.2 230)');
  });

  it('increments themeVersion when data-theme attribute changes', async () => {
    const { result } = renderHook(() => useCanvasColors(TOKEN_MAP));
    expect(result.current.themeVersion).toBe(0);

    await act(async () => {
      document.documentElement.setAttribute('data-theme', 'light');
      // MutationObserver fires asynchronously in jsdom
      await new Promise((resolve) => { setTimeout(resolve, 0); });
    });

    expect(result.current.themeVersion).toBe(1);
  });

  it('falls back to token name when property is not set', () => {
    const customMap = { missing: '--color-nonexistent' } as const;
    const { result } = renderHook(() => useCanvasColors(customMap));
    expect(result.current.colors.missing).toBe('--color-nonexistent');
  });
});
