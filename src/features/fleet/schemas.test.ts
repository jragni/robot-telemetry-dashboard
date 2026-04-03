import { describe, expect, it } from 'vitest';

import { addRobotSchema } from './schemas';

describe('addRobotSchema', () => {
  it('accepts a valid name and URL', () => {
    const result = addRobotSchema.safeParse({
      name: 'Robot Alpha',
      url: 'ws://192.168.1.10:9090',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = addRobotSchema.safeParse({
      name: '',
      url: 'ws://192.168.1.10:9090',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a whitespace-only name', () => {
    const result = addRobotSchema.safeParse({
      name: '   ',
      url: 'ws://192.168.1.10:9090',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a name longer than 50 characters', () => {
    const result = addRobotSchema.safeParse({
      name: 'A'.repeat(51),
      url: 'ws://192.168.1.10:9090',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a name that is exactly 50 characters', () => {
    const result = addRobotSchema.safeParse({
      name: 'A'.repeat(50),
      url: 'ws://192.168.1.10:9090',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid URL', () => {
    const result = addRobotSchema.safeParse({
      name: 'Robot Alpha',
      url: '://',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty URL', () => {
    const result = addRobotSchema.safeParse({
      name: 'Robot Alpha',
      url: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts bare hostnames as valid URLs', () => {
    const result = addRobotSchema.safeParse({
      name: 'Robot Alpha',
      url: 'robot.example.com:9090',
    });
    expect(result.success).toBe(true);
  });

  it('trims whitespace from name before validation', () => {
    const result = addRobotSchema.safeParse({
      name: '  Robot Alpha  ',
      url: 'ws://192.168.1.10:9090',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Robot Alpha');
    }
  });
});
