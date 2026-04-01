import { useState, useEffect } from 'react';

/** useResponsiveSize
 * @description Returns a reactive size value derived from viewport dimensions.
 *  Listens for window resize events with debouncing and recomputes the value.
 *  Skips setState when the computed value hasn't changed.
 * @param compute - Pure function that returns the desired size from current viewport.
 * @param debounceMs - Debounce delay in milliseconds. Defaults to 150.
 */
export function useResponsiveSize(compute: () => number, debounceMs = 150): number {
  const [size, setSize] = useState(compute);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    function handleResize() {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const next = compute();
        setSize((prev) => (prev === next ? prev : next));
      }, debounceMs);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [compute, debounceMs]);

  return size;
}
