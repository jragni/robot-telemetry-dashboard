import { describe, expect, it } from 'vitest';

import { extractNumericFields } from './extractNumericFields';

describe('extractNumericFields', () => {
  it('returns empty array for null/undefined input', () => {
    expect(extractNumericFields(null)).toEqual([]);
    expect(extractNumericFields(undefined)).toEqual([]);
  });

  it('returns empty array for non-object primitives', () => {
    expect(extractNumericFields('hello')).toEqual([]);
    expect(extractNumericFields(true)).toEqual([]);
  });

  it('returns top-level numeric field paths', () => {
    const msg = { x: 1.0, y: 2.0 };
    const result = extractNumericFields(msg);
    expect(result).toContain('x');
    expect(result).toContain('y');
    expect(result).toHaveLength(2);
  });

  it('extracts nested numeric fields as dot-paths', () => {
    const twist = {
      linear: { x: 0, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: 0 },
    };
    const result = extractNumericFields(twist);
    expect(result).toEqual(
      expect.arrayContaining([
        'linear.x',
        'linear.y',
        'linear.z',
        'angular.x',
        'angular.y',
        'angular.z',
      ])
    );
    expect(result).toHaveLength(6);
  });

  it('handles 3-level deep nesting', () => {
    const msg = { a: { b: { c: 42 } } };
    const result = extractNumericFields(msg);
    expect(result).toEqual(['a.b.c']);
  });

  it('skips string-valued fields', () => {
    const msg = { name: 'robot', value: 1.0 };
    const result = extractNumericFields(msg);
    expect(result).toContain('value');
    expect(result).not.toContain('name');
  });

  it('skips boolean-valued fields', () => {
    const msg = { active: true, speed: 1.5 };
    const result = extractNumericFields(msg);
    expect(result).toContain('speed');
    expect(result).not.toContain('active');
  });

  it('skips array fields (MVP scope)', () => {
    const msg = { covariance: [1, 2, 3], value: 1.0 };
    const result = extractNumericFields(msg);
    expect(result).toContain('value');
    expect(result).not.toContain('covariance');
    expect(result).not.toContain('0');
    expect(result).not.toContain('1');
  });

  it('skips null-valued fields', () => {
    const msg = { value: 1.0, empty: null };
    const result = extractNumericFields(msg);
    expect(result).toContain('value');
    expect(result).not.toContain('empty');
  });

  it('handles an IMU message shape correctly', () => {
    const imuMsg = {
      orientation: { x: 0, y: 0, z: 0, w: 1 },
      orientation_covariance: [-1, 0, 0, 0, 0, 0, 0, 0, 0], // array — skip
      angular_velocity: { x: 0.1, y: -0.05, z: 0.02 },
      angular_velocity_covariance: [0, 0, 0, 0, 0, 0, 0, 0, 0], // array — skip
      linear_acceleration: { x: 0.0, y: 0.0, z: 9.81 },
      linear_acceleration_covariance: [0, 0, 0, 0, 0, 0, 0, 0, 0], // array — skip
    };
    const result = extractNumericFields(imuMsg);
    expect(result).toEqual(
      expect.arrayContaining([
        'orientation.x',
        'orientation.y',
        'orientation.z',
        'orientation.w',
        'angular_velocity.x',
        'angular_velocity.y',
        'angular_velocity.z',
        'linear_acceleration.x',
        'linear_acceleration.y',
        'linear_acceleration.z',
      ])
    );
    // Covariance arrays should be excluded
    expect(result).not.toContain('orientation_covariance');
  });

  it('handles prefix parameter for recursive calls', () => {
    const msg = { x: 1.0 };
    const result = extractNumericFields(msg, 'linear');
    expect(result).toEqual(['linear.x']);
  });

  it('returns empty array for object with no numeric fields', () => {
    const msg = { name: 'robot', active: true, tags: [] };
    const result = extractNumericFields(msg);
    expect(result).toEqual([]);
  });
});
