import { formatLastSeen } from '@/utils/formatLastSeen';

describe('formatLastSeen', () => {
  it('returns em dash for null', () => {
    expect(formatLastSeen(null)).toBe('—');
  });

  it('returns "just now" for timestamps less than 5 seconds ago', () => {
    expect(formatLastSeen(Date.now())).toBe('just now');
    expect(formatLastSeen(Date.now() - 4999)).toBe('just now');
  });

  it('returns seconds ago for timestamps between 5s and 60s', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    expect(formatLastSeen(now - 5000)).toBe('5s ago');
    expect(formatLastSeen(now - 30000)).toBe('30s ago');
    expect(formatLastSeen(now - 59999)).toBe('59s ago');

    vi.restoreAllMocks();
  });

  it('returns minutes ago for timestamps between 1m and 60m', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    expect(formatLastSeen(now - 60000)).toBe('1m ago');
    expect(formatLastSeen(now - 300000)).toBe('5m ago');
    expect(formatLastSeen(now - 3599999)).toBe('59m ago');

    vi.restoreAllMocks();
  });

  it('returns hours ago for timestamps over 1 hour', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    expect(formatLastSeen(now - 3600000)).toBe('1h ago');
    expect(formatLastSeen(now - 7200000)).toBe('2h ago');
    expect(formatLastSeen(now - 86400000)).toBe('24h ago');

    vi.restoreAllMocks();
  });

  it('handles boundary at exactly 5 seconds', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    expect(formatLastSeen(now - 5000)).toBe('5s ago');

    vi.restoreAllMocks();
  });
});
