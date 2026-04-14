/** A single rosbridge protocol message (full wire format). */
export interface RosbridgeMessage {
  op: string;
  topic?: string;
  msg?: unknown;
  service?: string;
  values?: unknown;
  id?: string;
  type?: string;
  compression?: string;
  throttle_rate?: number;
  queue_length?: number;
}

/** Controller returned by createFakeRosbridge for test-side control. */
export interface FakeRosbridgeController {
  /** Topics the client has subscribed to. */
  readonly subscriptions: ReadonlySet<string>;

  /** Send a single message to the client. */
  send(message: RosbridgeMessage): void;

  /** Replay an array of fixture messages at a given interval (ms). */
  replay(messages: RosbridgeMessage[], intervalMs: number): void;

  /** Send all messages in a burst with no delay (backpressure testing). */
  burst(messages: RosbridgeMessage[]): void;

  /** Send a malformed (non-JSON) string to the client. */
  sendMalformed(): void;

  /** Close the WebSocket connection (triggers reconnect logic). */
  close(): void;

  /** Wait until the client has subscribed to a specific topic. */
  waitForSubscription(topic: string, timeoutMs?: number): Promise<void>;
}
