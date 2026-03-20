# Feature Spec: ROS Connection

## What It Does

Manages WebSocket connections to ROS2 robots via roslib/rosbridge. Provides:

- Connection lifecycle (connect, disconnect, reconnect with backoff)
- Topic subscription as RxJS Observables (with throttle, shareReplay)
- Topic publishing (Twist messages for control)
- Topic discovery (list available topics from connected robot)
- Per-robot transport instances via Registry pattern
- Connection state pushed to Zustand store

## Architecture (from v2, proven)

Three-layer pattern:

1. **roslib** — thin transport (WebSocket only)
2. **RxJS** — stream management (throttle, buffer, fan-out, teardown)
3. **Zustand** — UI state (connection status per robot)

### Module Breakdown

| Module             | Responsibility                                                                   |
| ------------------ | -------------------------------------------------------------------------------- |
| RosTransport       | WebSocket lifecycle, auto-reconnect with exponential backoff                     |
| TopicSubscriber    | Wraps roslib.Topic into RxJS Observable with throttle + shareReplay              |
| TopicPublisher     | Creates publish handle that advertises on first publish, unadvertises on cleanup |
| TopicDiscovery     | Calls ros.getTopics() and returns Observable<TopicInfo[]>                        |
| RosServiceRegistry | Singleton Map<robotId, RosTransport>, create-on-first-access                     |
| connections.store  | Zustand: robot list, active robot, persisted to localStorage                     |
| ros.store          | Zustand: per-robot connection state + errors (not persisted)                     |

## Edge Cases

- Robot disconnects during active subscriptions: auto-reconnect with exponential backoff, re-subscribe on reconnect
- Multiple rapid connect/disconnect calls: debounce via generation counter, stale connect callbacks ignored
- Subscribing to non-existent topic: graceful error emitted on Observable, not crash
- Robot bridge not available: connection error state, retry with backoff
- Multiple robots connected simultaneously: isolated transports per robot via Registry
- Hot module replacement during development: clean teardown via destroy()
- Calling connect() when already connected: no-op
- Calling disconnect() when already disconnected: no-op

## Acceptance Criteria

- [x] RosTransport: connect(), disconnect(), destroy(), connectionState$ BehaviorSubject
- [x] Auto-reconnect with configurable exponential backoff (3 attempts, 3s base interval)
- [x] TopicSubscriber: createTopicSubscription() returns Observable with throttleTime
- [x] TopicPublisher: createTopicPublisher() returns handle with .publish() and .dispose()
- [x] TopicDiscovery: getTopics$() returns Observable<TopicInfo[]>
- [x] RosServiceRegistry: singleton Map<robotId, RosTransport>, create-on-first-access
- [x] Connection Zustand store: robot list + active robot, persisted to localStorage
- [x] ROS Zustand store: per-robot connection state + errors
- [x] All connection state transitions covered by unit tests
- [x] roslib CommonJS workaround in vite.config.ts verified (existing from Phase 1)

## Configuration

```typescript
// src/config/ros.ts
export const ROS_CONFIG = {
  reconnect: {
    maxAttempts: 3,
    baseIntervalMs: 3000,
    backoffMultiplier: 2, // 3s, 6s, 12s
  },
  throttle: {
    defaultMs: 100, // Default throttle for topic subscriptions
  },
  defaultPort: 9090,
};
```

## File Structure

```
src/services/ros/
  transport/
    RosTransport.ts
    RosTransport.types.ts
    RosTransport.test.ts
  subscriber/
    TopicSubscriber.ts
    TopicSubscriber.types.ts
    TopicSubscriber.test.ts
  publisher/
    TopicPublisher.ts
    TopicPublisher.types.ts
    TopicPublisher.test.ts
  discovery/
    TopicDiscovery.ts
    TopicDiscovery.types.ts
    TopicDiscovery.test.ts
  registry/
    RosServiceRegistry.ts
    RosServiceRegistry.test.ts

src/shared/stores/
  connections/
    connections.store.ts
    connections.types.ts
    connections.store.test.ts
  ros/
    ros.store.ts
    ros.types.ts
    ros.store.test.ts

src/shared/types/
  connection.types.ts
  ros-messages.types.ts

src/config/
  ros.ts

src/test/mocks/
  roslib.mock.ts
```
