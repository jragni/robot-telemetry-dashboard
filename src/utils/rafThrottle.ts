/** rafThrottle
 * @description Throttles a callback to fire at most once per animation frame.
 *  Useful for bridging high-frequency ROS messages (10-100Hz) to React state
 *  updates without exceeding the display refresh rate.
 * @param callback - The function to throttle.
 * @returns A throttled version that batches calls to requestAnimationFrame.
 */
export function rafThrottle<T extends (...args: never[]) => void>(callback: T): T {
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

  return throttled as T;
}
