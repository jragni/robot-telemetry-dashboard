import '@testing-library/jest-dom/vitest';
import { configure as configureDom } from '@testing-library/dom';
import { act } from '@testing-library/react';
import * as vitest from 'vitest';

// react-grid-layout's WidthProvider uses ResizeObserver to track container width.
// jsdom does not implement ResizeObserver, so mock it with a no-op that calls the
// callback once on observe() to give WidthProvider a width of 0.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    private cb: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) {
      this.cb = cb;
    }
    observe(target: Element) {
      this.cb(
        [
          {
            target,
            contentRect: {
              width: 0,
              height: 0,
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              x: 0,
              y: 0,
              toJSON: () => ({}),
            },
          } as unknown as ResizeObserverEntry,
        ],
        this
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    unobserve() {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    disconnect() {}
  };
}

// Playwright MCP server can inject a non-standard localStorage proxy into the
// process environment, replacing the jsdom Storage with an object that lacks
// the standard methods (getItem, setItem, removeItem, clear). Restore a
// standards-compliant in-memory localStorage so test assertions work correctly.
(function restoreLocalStorage() {
  if (
    typeof localStorage !== 'undefined' &&
    typeof localStorage.clear !== 'function'
  ) {
    const store: Record<string, string> = {};
    const replacement: Storage = {
      get length() {
        return Object.keys(store).length;
      },
      key(index: number) {
        return Object.keys(store)[index] ?? null;
      },
      getItem(key: string) {
        return key in store ? store[key] : null;
      },
      setItem(key: string, value: string) {
        store[key] = String(value);
      },
      removeItem(key: string) {
        delete store[key];
      },
      clear() {
        for (const k of Object.keys(store)) delete store[k];
      },
    };
    Object.defineProperty(globalThis, 'localStorage', {
      value: replacement,
      writable: true,
      configurable: true,
    });
  }
})();

// embla-carousel calls window.matchMedia internally during initialisation.
// jsdom does not implement matchMedia, so provide a no-op stub.
if (typeof window.matchMedia === 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

// embla-carousel uses IntersectionObserver for slide-in-view tracking.
// jsdom does not implement it, so provide a no-op stub.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class IntersectionObserver {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    observe() {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    unobserve() {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
}

// @testing-library/dom's waitFor checks `typeof jest !== 'undefined'` to detect
// fake timers. Vitest with `globals: true` exposes `vi` but not `jest`.
// Assign it so waitFor can use jest.advanceTimersByTime() in fake timer mode.
(globalThis as Record<string, unknown>).jest = vitest.vi;

// Wrap waitFor's timer advancement in React's act() so state updates flush correctly.
configureDom({
  asyncUtilTimeout: 5000,
  unstable_advanceTimersWrapper: (cb) => act(cb),
});
