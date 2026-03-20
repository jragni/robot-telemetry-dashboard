# Phase 4: ROS Connection — Summary

## Workflow

SPEC > RED+GREEN (combined due to lint-staged requiring implementations) > SWEEP

## What Was Built

### Services (src/services/ros/)

| Module             | File                           | Tests | Description                                              |
| ------------------ | ------------------------------ | ----- | -------------------------------------------------------- |
| RosTransport       | transport/RosTransport.ts      | 10    | WebSocket lifecycle, auto-reconnect, exponential backoff |
| TopicSubscriber    | subscriber/TopicSubscriber.ts  | 5     | RxJS Observable wrappers with throttleTime, refCount     |
| TopicPublisher     | publisher/TopicPublisher.ts    | 4     | Publish handle with advertise/unadvertise lifecycle      |
| TopicDiscovery     | discovery/TopicDiscovery.ts    | 3     | Topic listing as Observable from ros.getTopics()         |
| RosServiceRegistry | registry/RosServiceRegistry.ts | 5     | Per-robot transport singleton Map                        |

### Stores (src/shared/stores/)

| Store       | File                             | Tests | Description                                         |
| ----------- | -------------------------------- | ----- | --------------------------------------------------- |
| connections | connections/connections.store.ts | 7     | Robot list CRUD, active robot, localStorage persist |
| ros         | ros/ros.store.ts                 | 8     | Per-robot connection state + errors                 |

### Supporting Files

| File                                   | Purpose                                        |
| -------------------------------------- | ---------------------------------------------- |
| src/config/ros.ts                      | ROS connection config constants                |
| src/shared/types/connection.types.ts   | ConnectionState, RobotConnection types         |
| src/shared/types/ros-messages.types.ts | Vector3, Twist, TopicInfo types                |
| src/test/mocks/roslib.mock.ts          | MockRos, MockTopic, MockMessage for unit tests |

## Test Count

- **New tests:** 42 (7 test files)
- **Total tests:** 82 (16 test files)
- **All passing**

## Quality Gate

- Lint: zero errors, zero warnings
- TypeScript: zero errors (strict mode)
- Tests: 82/82 passing
- Build: clean production build

## Key Decisions

1. **rosFactory injection pattern**: RosTransport accepts a `rosFactory` function instead of importing roslib directly. This enables clean unit testing with MockRos without module mocking.

2. **Ref-counted topic cleanup**: TopicSubscriber tracks subscriber count per topic and cleans up the roslib Topic when the last subscriber unsubscribes.

3. **localStorage graceful fallback**: connections.store uses a `getStorage()` helper that tests localStorage availability and falls back to undefined (no persistence) in test environments.

4. **RED+GREEN combined commit**: lint-staged pre-commit hook requires all imports to resolve, so failing test files (RED) cannot be committed without implementations. RED and GREEN phases were combined into a single commit.

## Commits

| Phase     | Hash    | Message                                            |
| --------- | ------- | -------------------------------------------------- |
| RED+GREEN | 8755af8 | feat(04): RED+GREEN — ROS connection feature (TDD) |
