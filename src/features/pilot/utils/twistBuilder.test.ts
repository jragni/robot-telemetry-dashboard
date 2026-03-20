import { describe, expect, it } from 'vitest';

import { buildTwist, zeroTwist } from './twistBuilder';

describe('TwistBuilder', () => {
  describe('buildTwist()', () => {
    it('forward produces positive linear.x, zero angular.z', () => {
      const twist = buildTwist('forward', 0.5, 0.5);
      expect(twist.linear.x).toBe(0.5);
      expect(twist.linear.y).toBe(0);
      expect(twist.linear.z).toBe(0);
      expect(twist.angular.x).toBe(0);
      expect(twist.angular.y).toBe(0);
      expect(twist.angular.z).toBe(0);
    });

    it('backward produces negative linear.x, zero angular.z', () => {
      const twist = buildTwist('backward', 0.5, 0.5);
      expect(twist.linear.x).toBe(-0.5);
      expect(twist.linear.y).toBe(0);
      expect(twist.linear.z).toBe(0);
      expect(twist.angular.z).toBe(0);
    });

    it('left produces zero linear.x, positive angular.z', () => {
      const twist = buildTwist('left', 0.5, 0.8);
      expect(twist.linear.x).toBe(0);
      expect(twist.angular.z).toBe(0.8);
    });

    it('right produces zero linear.x, negative angular.z', () => {
      const twist = buildTwist('right', 0.5, 0.8);
      expect(twist.linear.x).toBe(0);
      expect(twist.angular.z).toBe(-0.8);
    });

    it('stop produces all zeros', () => {
      const twist = buildTwist('stop', 0.5, 0.5);
      expect(twist.linear.x).toBe(0);
      expect(twist.linear.y).toBe(0);
      expect(twist.linear.z).toBe(0);
      expect(twist.angular.x).toBe(0);
      expect(twist.angular.y).toBe(0);
      expect(twist.angular.z).toBe(0);
    });

    it('uses the provided linear velocity magnitude', () => {
      expect(buildTwist('forward', 2.0, 0.5).linear.x).toBe(2.0);
      expect(buildTwist('backward', 1.5, 0.5).linear.x).toBe(-1.5);
    });

    it('uses the provided angular velocity magnitude', () => {
      expect(buildTwist('left', 0.5, 1.2).angular.z).toBe(1.2);
      expect(buildTwist('right', 0.5, 1.2).angular.z).toBe(-1.2);
    });
  });

  describe('zeroTwist()', () => {
    it('returns all-zero Twist', () => {
      const twist = zeroTwist();
      expect(twist.linear.x).toBe(0);
      expect(twist.linear.y).toBe(0);
      expect(twist.linear.z).toBe(0);
      expect(twist.angular.x).toBe(0);
      expect(twist.angular.y).toBe(0);
      expect(twist.angular.z).toBe(0);
    });

    it('returns a new object each call (no reference sharing)', () => {
      const a = zeroTwist();
      const b = zeroTwist();
      expect(a).not.toBe(b);
    });
  });
});
