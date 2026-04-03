import { describe, expect, it } from 'vitest';

import { ZERO_TWIST } from './constants';
import { buildTwist } from './helpers';

describe('buildTwist', () => {
  const linear = 0.5;
  const angular = 1.2;

  it('produces positive linear.x for forward', () => {
    const result = buildTwist('forward', linear, angular);

    expect(result.linear.x).toBe(linear);
    expect(result.linear.y).toBe(0);
    expect(result.linear.z).toBe(0);
    expect(result.angular).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('produces negative linear.x for backward', () => {
    const result = buildTwist('backward', linear, angular);

    expect(result.linear.x).toBe(-linear);
    expect(result.linear.y).toBe(0);
    expect(result.linear.z).toBe(0);
    expect(result.angular).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('produces positive angular.z for left', () => {
    const result = buildTwist('left', linear, angular);

    expect(result.linear).toEqual({ x: 0, y: 0, z: 0 });
    expect(result.angular.z).toBe(angular);
  });

  it('produces negative angular.z for right', () => {
    const result = buildTwist('right', linear, angular);

    expect(result.linear).toEqual({ x: 0, y: 0, z: 0 });
    expect(result.angular.z).toBe(-angular);
  });

  it('returns ZERO_TWIST equivalent for stop', () => {
    const result = buildTwist('stop', linear, angular);

    expect(result).toEqual(ZERO_TWIST);
  });
});
