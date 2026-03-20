/**
 * Mock roslib module for unit tests.
 * Provides fake ROSLIB.Ros, ROSLIB.Topic classes with event emitter behavior.
 */

type EventCallback = (...args: unknown[]) => void;

export class MockRos {
  private listeners = new Map<string, EventCallback[]>();
  private _topicRegistry = new Map<string, MockTopic>();
  public isConnected = false;
  public url: string | null = null;

  /**
   * Register a MockTopic by name so hooks can retrieve it by calling getRosTopic().
   * Used internally by MockTopic constructor.
   */
  _registerTopic(topic: MockTopic): void {
    this._topicRegistry.set(topic.name, topic);
  }

  _unregisterTopic(name: string): void {
    this._topicRegistry.delete(name);
  }

  /** Get the MockTopic registered for a given topic name. */
  getRosTopic(name: string): MockTopic | undefined {
    return this._topicRegistry.get(name);
  }

  connect(): void {
    this.isConnected = true;
    this.emit('connection');
  }

  close(): void {
    this.isConnected = false;
    this.emit('close');
  }

  on(event: string, callback: EventCallback): void {
    const existing = this.listeners.get(event) ?? [];
    existing.push(callback);
    this.listeners.set(event, existing);
  }

  off(event: string, callback: EventCallback): void {
    const existing = this.listeners.get(event) ?? [];
    this.listeners.set(
      event,
      existing.filter((cb) => cb !== callback)
    );
  }

  emit(event: string, ...args: unknown[]): void {
    const callbacks = this.listeners.get(event) ?? [];
    callbacks.forEach((cb) => cb(...args));
  }

  getTopics(
    callback: (result: { topics: string[]; types: string[] }) => void,
    errorCallback?: (error: string) => void
  ): void {
    if (!this.isConnected) {
      errorCallback?.('Not connected');
      return;
    }
    callback({
      topics: ['/cmd_vel', '/imu/data', '/scan'],
      types: [
        'geometry_msgs/Twist',
        'sensor_msgs/Imu',
        'sensor_msgs/LaserScan',
      ],
    });
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}

export class MockTopic {
  public name: string;
  public messageType: string;
  public ros: MockRos;
  public isAdvertised = false;
  private subscribeCallback: EventCallback | null = null;

  constructor(options: { ros: MockRos; name: string; messageType: string }) {
    this.name = options.name;
    this.messageType = options.messageType;
    this.ros = options.ros;
    // Register with ros so hooks can retrieve this instance
    this.ros._registerTopic(this);
  }

  subscribe(callback: EventCallback): void {
    this.subscribeCallback = callback;
  }

  unsubscribe(): void {
    this.subscribeCallback = null;
    this.ros._unregisterTopic(this.name);
  }

  publish(_message: unknown): void {
    // No-op in mock; tests can spy on this
  }

  advertise(): void {
    this.isAdvertised = true;
  }

  unadvertise(): void {
    this.isAdvertised = false;
  }

  /**
   * Test helper: simulate receiving a message on this topic.
   * Also emits on the ros instance so hooks using ros.on(name, cb) receive the message.
   */
  simulateMessage(message: unknown): void {
    this.subscribeCallback?.(message);
    this.ros.emit(this.name, message);
  }
}

export class MockMessage {
  [key: string]: unknown;

  constructor(values?: Record<string, unknown>) {
    if (values) {
      Object.assign(this, values);
    }
  }
}
