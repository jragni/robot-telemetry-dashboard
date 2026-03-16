# Testing Patterns

**Analysis Date:** 2026-03-16

## Test Framework

**Runner:**

- Vitest 4.1.0 - Unit and integration tests
- Config: `vite.config.ts` (test block)
- Environment: jsdom
- Globals: enabled (describe, it, expect available without import)
- Setup file: `src/test/utils/setup.ts`

**Assertion Library:**

- Vitest built-in expect
- @testing-library/jest-dom matchers (toBeInTheDocument, toHaveClass, etc.)
- Matchers: toBe, toEqual, toThrow, toMatchObject, toHaveBeenCalledWith

**Run Commands:**

```bash
npm test                    # Run all 510 tests (single run)
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report (v8 provider)
npm run e2e                 # Playwright E2E tests (Chromium)
npm run e2e:ui              # Playwright UI mode
npm run ci                  # Full pipeline: lint → typecheck → test → build
```

## Test File Organization

**Location:**

- Co-located with source: `*.test.ts` / `*.test.tsx` alongside implementation
- No separate `__tests__/` directories

**Naming:**

- Unit tests: `{source-name}.test.ts` (e.g., `layout.store.test.ts`)
- Hook tests: `{hookName}.test.ts` (e.g., `useControlPublisher.test.ts`)
- Service tests: `{ServiceName}.test.ts` (e.g., `RosTransport.test.ts`)
- E2E tests: `e2e/*.spec.ts` (e.g., `e2e/smoke.spec.ts`)

**Structure:**

```
src/
  stores/
    layout.store.ts
    layout.store.test.ts
  services/ros/
    RosTransport.ts
    RosTransport.test.ts
  features/control/hooks/
    useControlPublisher.ts
    useControlPublisher.test.ts
  features/slam/
    slam.utils.ts
    slam.utils.test.ts
e2e/
  smoke.spec.ts
```

## Test Structure

**Suite Organization:**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ModuleName', () => {
  // ---- Helper functions ----
  const resetStore = () => {
    /* ... */
  };

  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  describe('functionName', () => {
    it('should handle expected behavior', () => {
      // arrange
      const input = createTestInput();
      // act
      const result = functionName(input);
      // assert
      expect(result).toEqual(expectedOutput);
    });

    it('should handle edge case', () => {
      // test code
    });
  });
});
```

**Patterns:**

- Section headers with comment separators (`// ---- Section ----`)
- `beforeEach` for per-test setup and mock reset
- Helper functions for common setup (e.g., `resetStore()`, `setConnected()`)
- Arrange/Act/Assert pattern (implicit, not always commented)
- One logical assertion focus per test (multiple expects OK)

## Mocking

**Framework:**

- Vitest built-in: `vi.mock()`, `vi.fn()`, `vi.spyOn()`, `vi.mocked()`
- Module mocking at top of file

**Patterns:**

```typescript
// Module mocking
vi.mock('@/services/ros/RosServiceRegistry', () => ({
  RosServiceRegistry: { get: vi.fn(), create: vi.fn() },
}));

// Subject maps for controlling Observable emission in tests
const subjectMap = new Map<string, Subject<unknown>>();
vi.mock('@/services/ros/TopicSubscriber', () => ({
  createTopicSubscription: vi.fn((_id, topic) => {
    const s = new Subject();
    subjectMap.set(topic, s);
    return s.asObservable();
  }),
}));

// Fake objects with type assertions
const fakeRos = {} as import('roslib').Ros;
const fakeTransport = {
  ros: fakeRos,
  connect: vi.fn(),
} as unknown as RosTransport;
```

**What to Mock:**

- roslib (ROS WebSocket library) — `src/test/mocks/roslib.mock.ts`
- WebRTC browser APIs — `src/test/mocks/webrtc.mock.ts`
- IndexedDB — via `fake-indexeddb` package
- localStorage — mocked in `src/test/utils/setup.ts`
- Service registries and transports
- Canvas 2D context (for SLAM/LiDAR rendering tests)

**What NOT to Mock:**

- Pure utility functions (math, transforms, parsers)
- Zustand stores (test actual store logic)
- Type definitions

## Fixtures and Factories

**Test Data:**

```typescript
// Inline factory functions in test files
function createMockLaserScan(
  overrides?: Partial<LaserScanMessage>
): LaserScanMessage {
  return {
    header: { stamp: { secs: 0, nsecs: 0 }, frame_id: 'laser' },
    ranges: [1.0, 2.0, 3.0],
    angle_min: -Math.PI,
    angle_max: Math.PI,
    ...overrides,
  };
}
```

**Location:**

- Factory functions: Defined in individual test files near usage
- Shared mocks: `src/test/mocks/` (roslib.mock.ts, webrtc.mock.ts)
- Global setup: `src/test/utils/setup.ts` (localStorage mock, DOM setup)

## Coverage

**Requirements:**

- No enforced coverage target
- Coverage tracked for awareness
- Focus on core logic: stores, services, utilities, hooks

**Configuration:**

- Provider: v8 (via @vitest/coverage-v8)
- Reporters: text, json, html
- Excluded: `node_modules/`, `src/test/`, `**/*.d.ts`, `**/*.config.*`, `**/index.ts`

**View Coverage:**

```bash
npm run test:coverage
open coverage/index.html
```

## Test Types

**Unit Tests (510 across 34 files):**

- Scope: Individual store actions, service methods, utility functions, hooks
- Mocking: Mock all external dependencies (roslib, WebRTC, IndexedDB, Canvas)
- Speed: Full suite runs in ~3 seconds

**E2E Tests (8 Playwright smoke tests):**

- Framework: Playwright 1.58.2
- Browser: Chromium only
- Scope: Navigation, page loading, basic interactions
- Location: `e2e/smoke.spec.ts`
- Config: `playwright.config.ts` (base URL: http://localhost:5173, auto-starts dev server)

## Common Patterns

**Hook Testing:**

```typescript
import { renderHook, act } from '@testing-library/react';

it('should publish twist message', () => {
  const { result } = renderHook(() => useControlPublisher('robot-1'));
  act(() => {
    result.current.publishDirection('forward');
  });
  expect(mockPublish).toHaveBeenCalledWith(expectedTwist);
});
```

**RxJS Observable Testing:**

```typescript
it('should emit connection state changes', () => {
  const states: ConnectionState[] = [];
  transport.connectionState$.subscribe((s) => states.push(s));

  transport.connect('ws://localhost:9090');
  // trigger mock events...

  expect(states).toEqual(['connecting', 'connected']);
});
```

**Store Testing:**

```typescript
it('should add robot to store', () => {
  const store = useConnectionsStore.getState();
  store.addRobot({ name: 'Test Bot', baseUrl: 'http://localhost:8080' });
  expect(store.robots).toHaveLength(1);
  expect(store.robots[0].name).toBe('Test Bot');
});
```

**Canvas Rendering Testing:**

```typescript
const mockCtx = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
} as unknown as CanvasRenderingContext2D;

renderOccupancyGrid(mockCtx, gridData, transform);
expect(mockCtx.clearRect).toHaveBeenCalled();
```

---

_Testing analysis: 2026-03-16_
_Update when test patterns change_
