import { describe, expect, it } from 'vitest';

import { RingBuffer } from './RingBuffer';

describe('RingBuffer', () => {
  it('starts empty', () => {
    const buf = new RingBuffer<number>(5);
    expect(buf.size).toBe(0);
    expect(buf.toArray()).toEqual([]);
  });

  it('push increases size', () => {
    const buf = new RingBuffer<number>(5);
    buf.push(1);
    expect(buf.size).toBe(1);
    buf.push(2);
    expect(buf.size).toBe(2);
  });

  it('toArray returns items oldest to newest', () => {
    const buf = new RingBuffer<number>(5);
    buf.push(1);
    buf.push(2);
    buf.push(3);
    expect(buf.toArray()).toEqual([1, 2, 3]);
  });

  it('size is capped at capacity', () => {
    const buf = new RingBuffer<number>(3);
    buf.push(1);
    buf.push(2);
    buf.push(3);
    buf.push(4);
    expect(buf.size).toBe(3);
  });

  it('overwrites oldest item on overflow', () => {
    const buf = new RingBuffer<number>(3);
    buf.push(1);
    buf.push(2);
    buf.push(3);
    buf.push(4); // pushes out 1
    expect(buf.toArray()).toEqual([2, 3, 4]);
  });

  it('wraps around correctly over multiple overflow cycles', () => {
    const buf = new RingBuffer<number>(3);
    for (let i = 1; i <= 9; i++) {
      buf.push(i);
    }
    expect(buf.toArray()).toEqual([7, 8, 9]);
  });

  it('capacity of 1 always holds only the latest value', () => {
    const buf = new RingBuffer<number>(1);
    buf.push(10);
    buf.push(20);
    buf.push(30);
    expect(buf.toArray()).toEqual([30]);
    expect(buf.size).toBe(1);
  });

  it('works with generic types (objects)', () => {
    const buf = new RingBuffer<{ t: number; v: number }>(2);
    buf.push({ t: 1000, v: 1.0 });
    buf.push({ t: 2000, v: 2.0 });
    buf.push({ t: 3000, v: 3.0 });
    const result = buf.toArray();
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ t: 2000, v: 2.0 });
    expect(result[1]).toEqual({ t: 3000, v: 3.0 });
  });

  it('toArray returns a snapshot (not a live reference)', () => {
    const buf = new RingBuffer<number>(3);
    buf.push(1);
    buf.push(2);
    const snapshot = buf.toArray();
    buf.push(3);
    // Snapshot should not be mutated
    expect(snapshot).toHaveLength(2);
  });
});
