import { describe, it, expect } from 'vitest';
import { Ros, Topic, Service } from 'roslib';

describe('roslib 2.x ESM import', () => {
  it('exports Ros constructor via named import', () => {
    expect(Ros).toBeDefined();
    expect(typeof Ros).toBe('function');
  });

  it('exports Topic constructor via named import', () => {
    expect(Topic).toBeDefined();
    expect(typeof Topic).toBe('function');
  });

  it('exports Service constructor via named import', () => {
    expect(Service).toBeDefined();
    expect(typeof Service).toBe('function');
  });

  it('can instantiate Ros without throwing', () => {
    const ros = new Ros({ url: 'ws://localhost:9090' });
    expect(ros).toBeDefined();
  });
});
