export interface SubscriberOptions {
  compression?: 'cbor' | 'none';
  queueLength?: number;
  // throttle_rate is a minimum interval in MILLISECONDS between messages (not a Hz rate).
  throttleRate?: number;
  // When true (default), coalesce incoming messages to the latest one per animation
  // frame so a burst (e.g. a buffered backlog flushing after a bandwidth dip) is parsed
  // at most once per frame instead of all at once. Set false for consumers that must
  // see every message (e.g. time-series history accumulation).
  coalesce?: boolean;
}
