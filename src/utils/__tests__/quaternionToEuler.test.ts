import { quaternionToEuler } from '@/utils/quaternionToEuler';

describe('quaternionToEuler', () => {
  it('returns (0, 0, 0) for identity quaternion', () => {
    const result = quaternionToEuler({ x: 0, y: 0, z: 0, w: 1 });
    expect(result.roll).toBeCloseTo(0, 5);
    expect(result.pitch).toBeCloseTo(0, 5);
    expect(result.yaw).toBeCloseTo(0, 5);
  });

  it('computes 90 degree roll', () => {
    // Quaternion for 90° rotation about X axis
    const angle = Math.PI / 2;
    const q = { x: Math.sin(angle / 2), y: 0, z: 0, w: Math.cos(angle / 2) };
    const result = quaternionToEuler(q);
    expect(result.roll).toBeCloseTo(90, 0);
    expect(result.pitch).toBeCloseTo(0, 0);
    expect(result.yaw).toBeCloseTo(0, 0);
  });

  it('computes 90 degree pitch', () => {
    // Quaternion for 90° rotation about Y axis
    const angle = Math.PI / 2;
    const q = { x: 0, y: Math.sin(angle / 2), z: 0, w: Math.cos(angle / 2) };
    const result = quaternionToEuler(q);
    expect(result.pitch).toBeCloseTo(90, 0);
  });

  it('computes 90 degree yaw', () => {
    // Quaternion for 90° rotation about Z axis
    const angle = Math.PI / 2;
    const q = { x: 0, y: 0, z: Math.sin(angle / 2), w: Math.cos(angle / 2) };
    const result = quaternionToEuler(q);
    expect(result.roll).toBeCloseTo(0, 0);
    expect(result.pitch).toBeCloseTo(0, 0);
    expect(result.yaw).toBeCloseTo(90, 0);
  });

  it('handles gimbal lock at +90 pitch', () => {
    // sinp >= 1 triggers the clamp branch
    const q = { x: 0, y: Math.SQRT1_2, z: 0, w: Math.SQRT1_2 };
    const result = quaternionToEuler(q);
    expect(result.pitch).toBeCloseTo(90, 0);
  });

  it('handles gimbal lock at -90 pitch', () => {
    const q = { x: 0, y: -Math.SQRT1_2, z: 0, w: Math.SQRT1_2 };
    const result = quaternionToEuler(q);
    expect(result.pitch).toBeCloseTo(-90, 0);
  });

  it('handles 180 degree rotation about Z', () => {
    const q = { x: 0, y: 0, z: 1, w: 0 };
    const result = quaternionToEuler(q);
    expect(Math.abs(result.yaw)).toBeCloseTo(180, 0);
  });

  it('returns finite values for arbitrary quaternion', () => {
    const result = quaternionToEuler({ x: 0.1, y: 0.2, z: 0.3, w: 0.9 });
    expect(Number.isFinite(result.roll)).toBe(true);
    expect(Number.isFinite(result.pitch)).toBe(true);
    expect(Number.isFinite(result.yaw)).toBe(true);
  });
});
