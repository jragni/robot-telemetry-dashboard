import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { rafThrottle } from './rafThrottle';

describe('rafThrottle', () => {
  let rafCallbacks: Map<number, FrameRequestCallback>;
  let nextRafId: number;

  beforeEach(() => {
    rafCallbacks = new Map();
    nextRafId = 1;

    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((cb: FrameRequestCallback) => {
        const id = nextRafId++;
        rafCallbacks.set(id, cb);
        return id;
      }),
    );

    vi.stubGlobal(
      'cancelAnimationFrame',
      vi.fn((id: number) => {
        rafCallbacks.delete(id);
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function flushRaf() {
    for (const [id, cb] of rafCallbacks) {
      rafCallbacks.delete(id);
      cb(performance.now());
    }
  }

  it('calls callback on next animation frame', () => {
    const callback = vi.fn<(v: number) => void>();
    const throttled = rafThrottle(callback);

    throttled(42);
    expect(callback).not.toHaveBeenCalled();

    flushRaf();
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith(42);
  });

  it('coalesces multiple rapid calls to one callback with latest args', () => {
    const callback = vi.fn();
    const throttled = rafThrottle(callback);

    throttled('first');
    throttled('second');
    throttled('third');

    flushRaf();
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith('third');
  });

  it('cancel prevents pending callback from firing', () => {
    const callback = vi.fn();
    const throttled = rafThrottle(callback);

    throttled('data');
    throttled.cancel();

    flushRaf();
    expect(callback).not.toHaveBeenCalled();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it('can be called again normally after cancel', () => {
    const callback = vi.fn();
    const throttled = rafThrottle(callback);

    throttled('before-cancel');
    throttled.cancel();
    flushRaf();

    throttled('after-cancel');
    flushRaf();

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith('after-cancel');
  });

  it('cancel when nothing is pending is a no-op', () => {
    const callback = vi.fn();
    const throttled = rafThrottle(callback);

    expect(() => throttled.cancel()).not.toThrow();
    expect(cancelAnimationFrame).not.toHaveBeenCalled();
  });
});
