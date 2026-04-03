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
