import { describe, expect, it } from 'vitest';

import { LIDAR_POINT_RADIUS } from '@/constants/canvas';
import { LIDAR_CLOSE_THRESHOLD, LIDAR_MID_THRESHOLD } from '@/features/workspace/constants';

import {
  LIDAR_DISTANCE_RATIO_CAUTION,
  LIDAR_DISTANCE_RATIO_CRITICAL,
  LIDAR_POINT_RADIUS_MOBILE,
  MINIMAP_RANGE_DEFAULT,
} from './constants';

describe('PilotLidarMinimap constants', () => {
  describe('contract: minimap thresholds match workspace thresholds', () => {
    it('LIDAR_DISTANCE_RATIO_CRITICAL matches workspace LIDAR_CLOSE_THRESHOLD', () => {
      expect(LIDAR_DISTANCE_RATIO_CRITICAL).toBe(LIDAR_CLOSE_THRESHOLD);
    });

    it('LIDAR_DISTANCE_RATIO_CAUTION matches workspace LIDAR_MID_THRESHOLD', () => {
      expect(LIDAR_DISTANCE_RATIO_CAUTION).toBe(LIDAR_MID_THRESHOLD);
    });
  });

  describe('contract: threshold ordering', () => {
    it('CRITICAL threshold is less than CAUTION threshold', () => {
      expect(LIDAR_DISTANCE_RATIO_CRITICAL).toBeLessThan(LIDAR_DISTANCE_RATIO_CAUTION);
    });
  });

  describe('contract: minimap range default', () => {
    it('MINIMAP_RANGE_DEFAULT equals 3', () => {
      expect(MINIMAP_RANGE_DEFAULT).toBe(3);
    });
  });

  describe('contract: mobile point radius', () => {
    it('LIDAR_POINT_RADIUS_MOBILE is less than shared LIDAR_POINT_RADIUS', () => {
      expect(LIDAR_POINT_RADIUS_MOBILE).toBeLessThan(LIDAR_POINT_RADIUS);
    });
  });
});
