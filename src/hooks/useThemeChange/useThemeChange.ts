import { useEffect, useRef } from 'react';

/** useThemeChange
 * @description Invokes a callback whenever the data-theme attribute changes on the document element.
 *  Uses MutationObserver for efficient detection.
 * @param onThemeChange - Callback fired on theme change.
 */
export function useThemeChange(onThemeChange: () => void) {
  const callbackRef = useRef(onThemeChange);

  useEffect(() => {
    callbackRef.current = onThemeChange;
  }, [onThemeChange]);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          callbackRef.current();
          return;
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);
}
