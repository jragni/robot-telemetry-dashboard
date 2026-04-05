import { describe, it, expect } from 'vitest';

import { sensorVector3Schema, vector3Schema } from './ros2-schemas';

describe('vector3Schema', () => {
  it('accepts valid Vector3 message', () => {
    const result = vector3Schema.safeParse({ x: 1.0, y: 2.0, z: 3.0 });
    expect(result.success).toBe(true);
  });

  it('rejects missing fields', () => {
    const result = vector3Schema.safeParse({ x: 1.0, y: 2.0 });
    expect(result.success).toBe(false);
  });

  it('rejects non-number fields', () => {
    const result = vector3Schema.safeParse({ x: 'a', y: 2.0, z: 3.0 });
    expect(result.success).toBe(false);
  });

  it('accepts zero values', () => {
    const result = vector3Schema.safeParse({ x: 0, y: 0, z: 0 });
    expect(result.success).toBe(true);
  });
});

describe('sensorVector3Schema', () => {
  it('accepts valid Vector3 message', () => {
    const result = sensorVector3Schema.safeParse({ x: 1.0, y: 2.0, z: 3.0 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ x: 1.0, y: 2.0, z: 3.0 });
    }
  });

  it('accepts null axes and defaults to 0', () => {
    const result = sensorVector3Schema.safeParse({ x: null, y: 2.0, z: null });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ x: 0, y: 2.0, z: 0 });
    }
  });

  it('accepts all null axes', () => {
    const result = sensorVector3Schema.safeParse({ x: null, y: null, z: null });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ x: 0, y: 0, z: 0 });
    }
  });

  it('defaults missing axes to 0', () => {
    const result = sensorVector3Schema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ x: 0, y: 0, z: 0 });
    }
  });

  it('rejects non-number non-null fields', () => {
    const result = sensorVector3Schema.safeParse({ x: 'a', y: 2.0, z: 3.0 });
    expect(result.success).toBe(false);
  });
});
