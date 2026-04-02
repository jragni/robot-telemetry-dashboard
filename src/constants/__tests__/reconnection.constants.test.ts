import {
  calculateBackoffDelay,
  RECONNECT_BASE_DELAY,
  RECONNECT_MAX_DELAY,
} from '@/constants/reconnection.constants';

describe('calculateBackoffDelay', () => {
  it('returns base delay for attempt 0', () => {
    expect(calculateBackoffDelay(0)).toBe(RECONNECT_BASE_DELAY);
  });

  it('doubles delay for each subsequent attempt', () => {
    expect(calculateBackoffDelay(1)).toBe(RECONNECT_BASE_DELAY * 2);
    expect(calculateBackoffDelay(2)).toBe(RECONNECT_BASE_DELAY * 4);
  });

  it('caps delay at RECONNECT_MAX_DELAY', () => {
    expect(calculateBackoffDelay(100)).toBe(RECONNECT_MAX_DELAY);
  });

  it('returns exact max delay at the boundary', () => {
    // Find the attempt where base * 2^attempt >= max
    let attempt = 0;
    while (RECONNECT_BASE_DELAY * 2 ** attempt < RECONNECT_MAX_DELAY) {
      attempt++;
    }
    expect(calculateBackoffDelay(attempt)).toBe(RECONNECT_MAX_DELAY);
  });
});
