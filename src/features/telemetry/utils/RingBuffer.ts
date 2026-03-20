/**
 * Fixed-capacity ring buffer. Overwrites oldest items when full.
 */
export class RingBuffer<T> {
  private readonly buffer: (T | undefined)[];
  private readonly capacity: number;
  private head = 0; // next write position
  private count = 0;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Array<T | undefined>(capacity);
  }

  push(item: T): void {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this.count < this.capacity) {
      this.count++;
    }
  }

  get size(): number {
    return this.count;
  }

  /** Returns a snapshot array from oldest to newest. */
  toArray(): T[] {
    if (this.count === 0) return [];

    const result: T[] = new Array<T>(this.count);
    const start = this.count < this.capacity ? 0 : this.head;

    for (let i = 0; i < this.count; i++) {
      result[i] = this.buffer[(start + i) % this.capacity] as T;
    }

    return result;
  }
}
