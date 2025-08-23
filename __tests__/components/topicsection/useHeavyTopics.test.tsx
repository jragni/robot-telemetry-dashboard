import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHeavyTopics } from '@/components/topicsection/useHeavyTopics';

describe('useHeavyTopics', () => {
  it('should return isHeavyTopic function', () => {
    const { result } = renderHook(() => useHeavyTopics());
    
    expect(result.current).toHaveProperty('isHeavyTopic');
    expect(typeof result.current.isHeavyTopic).toBe('function');
  });

  describe('isHeavyTopic function', () => {
    it('should identify Image messages as heavy', () => {
      const { result } = renderHook(() => useHeavyTopics());
      
      expect(result.current.isHeavyTopic('sensor_msgs/msg/Image')).toBe(true);
    });

    it('should identify CompressedImage messages as heavy', () => {
      const { result } = renderHook(() => useHeavyTopics());
      
      expect(result.current.isHeavyTopic('sensor_msgs/msg/CompressedImage')).toBe(true);
    });

    it('should identify PointCloud2 messages as heavy', () => {
      const { result } = renderHook(() => useHeavyTopics());
      
      expect(result.current.isHeavyTopic('sensor_msgs/msg/PointCloud2')).toBe(true);
    });

    it('should identify PointCloud messages as heavy', () => {
      const { result } = renderHook(() => useHeavyTopics());
      
      expect(result.current.isHeavyTopic('sensor_msgs/msg/PointCloud')).toBe(true);
    });

    it('should identify MarkerArray messages as heavy', () => {
      const { result } = renderHook(() => useHeavyTopics());
      
      expect(result.current.isHeavyTopic('visualization_msgs/msg/MarkerArray')).toBe(true);
    });

    it('should identify OccupancyGrid messages as heavy', () => {
      const { result } = renderHook(() => useHeavyTopics());
      
      expect(result.current.isHeavyTopic('nav_msgs/msg/OccupancyGrid')).toBe(true);
    });

    it('should not identify String messages as heavy', () => {
      const { result } = renderHook(() => useHeavyTopics());
      
      expect(result.current.isHeavyTopic('std_msgs/msg/String')).toBe(false);
    });

    it('should not identify Twist messages as heavy', () => {
      const { result } = renderHook(() => useHeavyTopics());
      
      expect(result.current.isHeavyTopic('geometry_msgs/msg/Twist')).toBe(false);
    });

    it('should not identify Odometry messages as heavy', () => {
      const { result } = renderHook(() => useHeavyTopics());
      
      expect(result.current.isHeavyTopic('nav_msgs/msg/Odometry')).toBe(false);
    });

    it('should handle empty string', () => {
      const { result } = renderHook(() => useHeavyTopics());
      
      expect(result.current.isHeavyTopic('')).toBe(false);
    });

    it('should handle unknown message types', () => {
      const { result } = renderHook(() => useHeavyTopics());
      
      expect(result.current.isHeavyTopic('unknown/msg/Type')).toBe(false);
    });

    it('should be case sensitive', () => {
      const { result } = renderHook(() => useHeavyTopics());
      
      expect(result.current.isHeavyTopic('sensor_msgs/msg/image')).toBe(false);
      expect(result.current.isHeavyTopic('SENSOR_MSGS/MSG/IMAGE')).toBe(false);
    });
  });

  describe('heavy topic types coverage', () => {
    it('should include all expected heavy data types', () => {
      const { result } = renderHook(() => useHeavyTopics());
      
      const heavyTypes = [
        'sensor_msgs/msg/Image',
        'sensor_msgs/msg/CompressedImage',
        'sensor_msgs/msg/PointCloud2',
        'sensor_msgs/msg/PointCloud',
        'visualization_msgs/msg/MarkerArray',
        'nav_msgs/msg/OccupancyGrid',
      ];

      heavyTypes.forEach(type => {
        expect(result.current.isHeavyTopic(type)).toBe(true);
      });
    });

    it('should not include light data types', () => {
      const { result } = renderHook(() => useHeavyTopics());
      
      const lightTypes = [
        'std_msgs/msg/String',
        'std_msgs/msg/Bool',
        'std_msgs/msg/Float64',
        'geometry_msgs/msg/Twist',
        'geometry_msgs/msg/PoseStamped',
        'nav_msgs/msg/Odometry',
        'sensor_msgs/msg/Temperature',
        'sensor_msgs/msg/Imu',
      ];

      lightTypes.forEach(type => {
        expect(result.current.isHeavyTopic(type)).toBe(false);
      });
    });
  });
});