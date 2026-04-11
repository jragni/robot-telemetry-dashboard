export interface SubscriberOptions {
  compression?: 'cbor' | 'none';
  queueLength?: number;
  throttleRate?: number;
}
