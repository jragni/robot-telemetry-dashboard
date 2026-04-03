import { describe, it, expect } from 'vitest';

import { vector3Schema } from './ros2-schemas';

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
