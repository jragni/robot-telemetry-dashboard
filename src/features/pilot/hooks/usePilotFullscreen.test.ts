import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { usePilotFullscreen } from './usePilotFullscreen';

function fireKey(key: string, target?: HTMLElement) {
  const el = target ?? document;
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('usePilotFullscreen', () => {
  it('toggles fullscreen on F key', () => {
    const { result } = renderHook(() => usePilotFullscreen());
    expect(result.current.isFullscreen).toBe(false);

    act(() => { fireKey('f'); });
    expect(result.current.isFullscreen).toBe(true);

    act(() => { fireKey('f'); });
    expect(result.current.isFullscreen).toBe(false);
  });

  it('does not toggle when target is an input element', () => {
    const { result } = renderHook(() => usePilotFullscreen());
    const input = document.createElement('input');

    act(() => { fireKey('f', input); });
    expect(result.current.isFullscreen).toBe(false);
  });

  it('does not toggle when target is a textarea element', () => {
    const { result } = renderHook(() => usePilotFullscreen());
    const textarea = document.createElement('textarea');

    act(() => { fireKey('f', textarea); });
    expect(result.current.isFullscreen).toBe(false);
  });

  it('does not toggle when target is a contentEditable element', () => {
    const { result } = renderHook(() => usePilotFullscreen());
    const div = document.createElement('div');
    div.setAttribute('contenteditable', 'true');
    document.body.appendChild(div);

    act(() => {
      div.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', bubbles: true, cancelable: true }));
    });
    expect(result.current.isFullscreen).toBe(false);

    document.body.removeChild(div);
  });

  it('exits fullscreen on Escape', () => {
    const { result } = renderHook(() => usePilotFullscreen());

    act(() => { fireKey('f'); });
    expect(result.current.isFullscreen).toBe(true);

    act(() => { fireKey('Escape'); });
    expect(result.current.isFullscreen).toBe(false);
  });
});
