import { useState, useEffect } from 'react';

/** useResponsiveSize
 * @description Tracks a computed dimension that updates on window resize with debouncing.
 * @param compute - Function that returns the current size value.
 * @param debounceMs - Debounce delay in milliseconds (default 150).
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
