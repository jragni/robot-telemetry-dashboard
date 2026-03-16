import { useState, useCallback, useRef } from 'react';

import type { ElementSize } from './useElementSize.types';

/**
 * Returns a [ref, size] tuple.  Attach the ref to a DOM element and the hook
 * will keep `size` in sync via a ResizeObserver.
 *
 * The initial size is { width: 0, height: 0 } and updates on every layout
 * change.
 */
export function useElementSize<T extends HTMLElement = HTMLDivElement>(): [
  (node: T | null) => void,
  ElementSize,
] {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: T | null) => {
    // Disconnect any previously observed element
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (node === null) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    observer.observe(node);
    observerRef.current = observer;

    // Capture initial size immediately
    const { width, height } = node.getBoundingClientRect();
    setSize({ width, height });
  }, []);

  return [ref, size];
}
