import { useCallback, useRef, useState } from 'react';

export interface ElementSize {
  width: number;
  height: number;
}

/**
 * Tracks the rendered size of a DOM element via ResizeObserver.
 * Reactive to all container width changes (e.g. sidebar resize).
 * Use the returned ref on the element you want to measure.
 */
export function useElementSize<T extends HTMLElement = HTMLDivElement>(): [
  React.RefCallback<T>,
  ElementSize,
] {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: T | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (node) {
      observerRef.current = new ResizeObserver(([entry]) => {
        if (entry) {
          const { width, height } = entry.contentRect;
          setSize({ width, height });
        }
      });
      observerRef.current.observe(node);
    }
  }, []);

  return [ref, size];
}
