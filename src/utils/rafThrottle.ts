export type CancellableThrottled<T extends (...args: never[]) => void> = T & {
  cancel: () => void;
};

/** rafThrottle
 * @description Throttles a callback to fire at most once per requestAnimationFrame.
 *  Returns a cancellable wrapper that coalesces rapid calls.
 * @param callback - The function to throttle.
 */
export function rafThrottle<T extends (...args: never[]) => void>(
  callback: T,
): CancellableThrottled<T> {
  let rafId: number | null = null;
  let latestArgs: Parameters<T> | null = null;

  const throttled = (...args: Parameters<T>) => {
    latestArgs = args;
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      if (latestArgs) {
        callback(...latestArgs);
        latestArgs = null;
      }
    });
  };

  throttled.cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    latestArgs = null;
  };

  return throttled as CancellableThrottled<T>;
}
