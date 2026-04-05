import { describe, expect, it } from 'vitest';

import { calculateBackoffDelay } from './reconnection';

describe('calculateBackoffDelay', () => {
  it('returns 2000ms for attempt 0', () => {
    expect(calculateBackoffDelay(0)).toBe(2000);
  });

  it('returns 4000ms for attempt 1', () => {
    expect(calculateBackoffDelay(1)).toBe(4000);
  });

  it('caps at 30000ms for attempt 4', () => {
    expect(calculateBackoffDelay(4)).toBe(30_000);
  });

  it('caps at 30000ms for large attempt numbers', () => {
    expect(calculateBackoffDelay(100)).toBe(30_000);
  });
});
