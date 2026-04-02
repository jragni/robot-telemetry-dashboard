import { rafThrottle } from '@/utils/rafThrottle';

describe('rafThrottle', () => {
  let rafCallbacks: (() => void)[];
  let originalRAF: typeof requestAnimationFrame;

  beforeEach(() => {
    rafCallbacks = [];
    originalRAF = globalThis.requestAnimationFrame;
    globalThis.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
      rafCallbacks.push(() => { cb(0); });
      return rafCallbacks.length;
    }) as unknown as typeof requestAnimationFrame;
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRAF;
  });

  function flushRAF() {
    const cbs = [...rafCallbacks];
    rafCallbacks = [];
    cbs.forEach((cb) => { cb(); });
  }

  it('executes the callback on the next animation frame', () => {
    const fn = vi.fn();
    const throttled = rafThrottle(fn);

    throttled(42);
    expect(fn).not.toHaveBeenCalled();

    flushRAF();
    expect(fn).toHaveBeenCalledWith(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('deduplicates rapid calls to use only the latest args', () => {
    const fn = vi.fn();
    const throttled = rafThrottle(fn);

    throttled('first');
    throttled('second');
    throttled('third');

    expect(fn).not.toHaveBeenCalled();
    flushRAF();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('third');
  });

  it('allows a new call after the previous frame fires', () => {
    const fn = vi.fn();
    const throttled = rafThrottle(fn);

    throttled('a');
    flushRAF();
    expect(fn).toHaveBeenCalledWith('a');

    throttled('b');
    flushRAF();
    expect(fn).toHaveBeenCalledWith('b');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('passes multiple arguments correctly', () => {
    const fn = vi.fn();
    const throttled = rafThrottle(fn);

    throttled(1, 2, 3);
    flushRAF();

    expect(fn).toHaveBeenCalledWith(1, 2, 3);
  });
});
