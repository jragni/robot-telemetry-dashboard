# Architecture Patterns

**Domain:** Real-time robot telemetry dashboard (ROS2, multi-robot, browser-based)
**Researched:** 2026-03-22

## Recommended Architecture

Three-layer data pipeline with strict unidirectional flow:

```
[rosbridge WS] --> [Transport Layer] --> [Stream Layer] --> [State Layer] --> [View Layer]
     roslib            RosService           RxJS             Zustand          React
```

Each layer has a single responsibility and communicates only with its immediate neighbors. No layer skips. Components never touch roslib directly.

### Layer Responsibilities

| Layer | Technology | Responsibility | Owns |
|-------|-----------|---------------|------|
| Transport | roslib + custom reconnection | WebSocket lifecycle, message serialization | Connection state, raw message I/O |
| Stream | RxJS | Rate limiting, buffering, transformation, multi-cast | Observable pipelines per topic |
| State | Zustand (multiple stores) | UI-ready snapshots, entity normalization | Derived/computed state for rendering |
| View | React 19 | Rendering, user interaction | Component tree, local UI state only |

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `RosConnectionManager` | WebSocket lifecycle, reconnection with exponential backoff | Stream layer (exposes connection status observable) |
| `TopicStreamFactory` | Creates/caches RxJS observables from roslib Topic subscriptions | Transport layer (subscribes to topics), State layer (pushes values) |
| `ServiceCaller` | Wraps roslib Service calls as Promises/Observables | Transport layer only |
| `ConnectionStore` | Tracks per-robot connection state (url, status, lastSeen) | View layer (selectors), Transport layer (connection events) |
| `FleetStore` | Robot registry: which robots exist, their metadata | View layer (selectors) |
| `TelemetryStore` | Per-robot telemetry snapshots (IMU, LiDAR point counts, battery) | Stream layer (receives updates), View layer (selectors) |
| `ControlStore` | E-stop state, velocity commands, control mode | View layer (actions), Transport layer (publishes commands) |
| `MapStore` | Occupancy grid data, robot poses, map metadata | Stream layer (receives map updates), Canvas renderer |
| `OccupancyGridRenderer` | Canvas-based map rendering with ImageData | MapStore (reads grid data), View layer (provides canvas ref) |
| `TelemetryCharts` | Time-series data visualization | TelemetryStore (reads history), View layer (renders charts) |

---

## Data Flow

### Inbound (Robot to Dashboard)

```
rosbridge_server (on robot)
    |
    | WebSocket (ws://robot-ip:9090)
    v
RosConnectionManager
    |
    | ROSLIB.Topic.subscribe() callback
    v
TopicStreamFactory
    |
    | new Subject<T>().next(message)
    v
RxJS Pipeline (per topic type)
    |
    | .pipe(throttleTime(100), map(transform), shareReplay(1))
    v
Zustand Store (per domain)
    |
    | useStore(selector) -- fine-grained subscription
    v
React Component (re-renders only on selected state change)
```

### Outbound (Dashboard to Robot)

```
React Component (button click, slider change)
    |
    | store.getState().publishVelocity(linear, angular)
    v
ControlStore (validates, rate-limits)
    |
    | TopicStreamFactory.publish(topic, message)
    v
RosConnectionManager (checks connection active)
    |
    | ROSLIB.Topic.publish(new ROSLIB.Message({...}))
    v
rosbridge_server --> ROS2 topic
```

### Occupancy Grid Flow (Special Path)

```
/map topic (nav_msgs/OccupancyGrid)
    |
    | Large payload: width * height int8 array
    | On-demand fetch, NOT continuous subscription
    v
TopicStreamFactory.requestOnce(topic)
    |
    | Single message, then unsubscribe
    v
MapStore.setGrid(data, metadata)
    |
    | Uint8ClampedArray conversion (occupancy -> RGBA)
    v
OccupancyGridRenderer
    |
    | OffscreenCanvas in Web Worker (if supported)
    | Fallback: main thread ImageData + putImageData
    v
<canvas> element (React ref)
```

---

## Patterns to Follow

### Pattern 1: Connection Manager with Exponential Backoff

**What:** Custom reconnection wrapper around roslib's Ros class, since roslibjs has NO built-in reconnection support.
**When:** Always -- this is the transport foundation.
**Why:** roslib emits `close` events but does not reconnect. The dashboard must recover from network interruptions, robot reboots, and rosbridge restarts without user intervention.

```typescript
// src/features/ros/services/RosConnectionManager.ts

interface ConnectionConfig {
  url: string;
  robotId: string;
  reconnect: {
    enabled: boolean;
    baseDelay: 500;      // ms
    maxDelay: 30_000;    // ms cap
    maxAttempts: 15;
    jitter: true;        // randomize to prevent thundering herd
  };
}

// Backoff formula: min(baseDelay * 2^attempt + random(0, 1000), maxDelay)
// Reset attempt counter on successful connection.
// Emit connection state changes as RxJS BehaviorSubject.
// On reconnect: re-subscribe all previously active topics.
```

**Confidence:** HIGH -- verified roslib source has no reconnection params. Custom implementation required.

### Pattern 2: Topic Stream Factory (Observable Cache)

**What:** Singleton factory that creates and caches RxJS Observables wrapping roslib Topic subscriptions. One Observable per (robotId, topicName) pair.
**When:** Any component needs telemetry data from a ROS topic.

```typescript
// Key: `${robotId}::${topicName}`
// Value: Observable<T> with shareReplay(1) for late subscribers

// Lifecycle:
// 1. First subscriber -> create ROSLIB.Topic, .subscribe(), pipe to Subject
// 2. Additional subscribers -> return cached Observable (shared via shareReplay)
// 3. Last unsubscribe -> ROSLIB.Topic.unsubscribe(), remove from cache
// 4. On reconnection -> re-subscribe all active cache entries
```

**Why:** Prevents duplicate subscriptions to the same topic, enables automatic cleanup, and provides a single point for applying rate-limiting operators.

### Pattern 3: RxJS Pipeline Recipes by Data Type

**What:** Different ROS message types need different stream processing strategies.

| Data Type | Topic Example | RxJS Pipeline | Rationale |
|-----------|--------------|---------------|-----------|
| IMU | `/imu/data` | `throttleTime(100)` -> `map(extract)` -> `shareReplay(1)` | 100Hz sensor, UI needs ~10Hz max |
| Battery | `/battery_state` | `distinctUntilChanged(deepEqual)` -> `shareReplay(1)` | Changes rarely, skip duplicates |
| Velocity cmd | `/cmd_vel` | `throttleTime(50)` on publish side | Rate-limit outbound commands |
| Joint states | `/joint_states` | `scan(accumulate)` -> `throttleTime(200)` | Accumulate partial updates |
| Diagnostics | `/diagnostics` | `bufferTime(2000)` -> `map(latest)` | Batch low-priority data |
| Map | `/map` | Single request, no continuous stream | On-demand fetch (see bandwidth note) |
| Camera | `/camera/compressed` | `throttleTime(33)` (~30fps cap) | Bound frame rate |

### Pattern 4: Zustand Multi-Robot State with Normalized Entities

**What:** Use MULTIPLE separate Zustand stores (not one mega-store with slices) because robot domains are independent. Normalize robot data as `Record<string, RobotState>` keyed by robotId.
**When:** Always -- this is the state architecture.

```typescript
// src/features/fleet/stores/useFleetStore.ts
interface FleetState {
  robots: Record<string, RobotMeta>;       // robotId -> metadata
  selectedRobotId: string | null;
  addRobot: (meta: RobotMeta) => void;
  removeRobot: (id: string) => void;
  selectRobot: (id: string) => void;
}

// src/features/telemetry/stores/useTelemetryStore.ts
interface TelemetryState {
  snapshots: Record<string, TelemetrySnapshot>;  // robotId -> latest values
  history: Record<string, TelemetryPoint[]>;     // robotId -> rolling buffer
  updateSnapshot: (robotId: string, data: Partial<TelemetrySnapshot>) => void;
}

// src/features/connection/stores/useConnectionStore.ts
interface ConnectionState {
  connections: Record<string, ConnectionInfo>;    // robotId -> connection state
  connect: (robotId: string, url: string) => void;
  disconnect: (robotId: string) => void;
}
```

**Why separate stores over slices:** Each store is independently subscribed. A telemetry update for Robot A never triggers re-evaluation in the fleet list. Per ADR-002, stores live in their domain folders.

**Selector pattern (critical for performance):**
```typescript
// GOOD: atomic selector, re-renders only when this robot's IMU changes
const imu = useTelemetryStore(s => s.snapshots[robotId]?.imu);

// BAD: returns new object reference every time, causes infinite re-renders
const all = useTelemetryStore(s => s.snapshots);
```

### Pattern 5: Occupancy Grid Canvas Rendering

**What:** Render OccupancyGrid as canvas ImageData, not DOM elements.
**When:** Map view is active and grid data is loaded.

```typescript
// Conversion: OccupancyGrid int8[] -> RGBA Uint8ClampedArray
// Values: -1 (unknown) -> gray, 0 (free) -> dark, 100 (occupied) -> bright
// Size: 4000x4000 grid = 64MB RGBA buffer -> use Web Worker

// Rendering strategy:
// 1. Receive grid data (width * height int8 array)
// 2. Post to Web Worker with Transferable (zero-copy)
// 3. Worker converts to ImageData RGBA buffer
// 4. Worker posts back ImageData buffer as Transferable
// 5. Main thread: ctx.putImageData() -- single call, no loop
// 6. Overlay robot positions with standard canvas drawing on top layer

// Use two-canvas stack:
// - Bottom canvas: occupancy grid (updated infrequently)
// - Top canvas: robot markers, paths (updated at animation frame rate)
```

**Why not WebGL:** Occupancy grids are static 2D pixel data. Canvas2D ImageData is simpler, well-supported, and sufficient. WebGL adds complexity without benefit for flat grids.

### Pattern 6: Subscription Lifecycle Tied to React

**What:** Use `useEffect` cleanup to unsubscribe from RxJS observables when components unmount.
**When:** Every component that subscribes to telemetry streams.

```typescript
function useTelemetryStream(robotId: string, topic: string) {
  const updateStore = useTelemetryStore(s => s.updateSnapshot);

  useEffect(() => {
    const sub = topicStreamFactory
      .getStream(robotId, topic)
      .pipe(throttleTime(100))
      .subscribe(msg => updateStore(robotId, transform(msg)));

    return () => sub.unsubscribe(); // cleanup on unmount or robotId change
  }, [robotId, topic]);
}
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Components Subscribing Directly to roslib

**What:** Calling `new ROSLIB.Topic().subscribe()` inside React components.
**Why bad:** No cleanup guarantee, no rate limiting, no reconnection handling, duplicate subscriptions, tight coupling to transport. This was a primary failure in v1.
**Instead:** Always go through TopicStreamFactory, which handles caching, cleanup, and reconnection.

### Anti-Pattern 2: Storing Full Message History in Zustand

**What:** Pushing every incoming telemetry message into a Zustand array.
**Why bad:** At 100Hz IMU data, you get 360,000 messages/hour. Memory grows unbounded. Zustand notifies all subscribers on every push.
**Instead:** Use a fixed-size ring buffer (last N points, e.g., 300 for 30s at 10Hz). Keep the ring buffer outside Zustand (in a ref or class instance), snapshot into Zustand at a throttled rate for chart rendering.

### Anti-Pattern 3: Single Monolithic Zustand Store

**What:** One `create()` call containing connection + fleet + telemetry + control + map state.
**Why bad:** Any state change triggers selector re-evaluation across all domains. Telemetry updates (high frequency) pollute control state listeners (low frequency).
**Instead:** Separate stores per domain. Cross-store communication via explicit function calls, not shared state.

### Anti-Pattern 4: Continuous Map Subscription

**What:** Subscribing to `/map` like a regular telemetry topic with continuous updates.
**Why bad:** OccupancyGrid messages are massive (potentially 16MB+ per message at 4000x4000). Continuous subscription at even 1Hz would consume 960MB/min bandwidth.
**Instead:** On-demand fetch: subscribe, receive one message, unsubscribe. Re-fetch only when user requests or on significant map change notification.

### Anti-Pattern 5: Re-creating Canvas on Every Render

**What:** Using `document.createElement('canvas')` or losing canvas context on React re-render.
**Why bad:** Destroys GPU-allocated resources, causes flicker, and is expensive.
**Instead:** Use a React ref (`useRef<HTMLCanvasElement>`) and keep the canvas element stable. Only update pixel data via `putImageData()`.

---

## Detailed Component Architecture

### Directory Structure

```
src/
  features/
    ros/                          # Transport layer
      services/
        RosConnectionManager.ts   # WebSocket lifecycle + reconnection
        TopicStreamFactory.ts     # Observable cache per topic
        ServiceCaller.ts          # ROS service call wrapper
      types/
        ros.types.ts              # ROS message type definitions
      hooks/
        useRosConnection.ts       # Hook wrapping connection manager

    connection/                   # Connection state domain
      stores/
        useConnectionStore.ts     # Per-robot connection status

    fleet/                        # Fleet management domain
      stores/
        useFleetStore.ts          # Robot registry + selection
      components/
        FleetOverview.tsx         # Grid of robot cards
        RobotCard.tsx             # Individual robot status card

    telemetry/                    # Telemetry data domain
      stores/
        useTelemetryStore.ts      # Per-robot telemetry snapshots
      services/
        TelemetryRingBuffer.ts    # Fixed-size history buffer (class, not store)
      components/
        ImuWidget.tsx             # IMU data display
        DataPlotWidget.tsx        # Time-series chart

    control/                      # Robot control domain
      stores/
        useControlStore.ts        # E-stop, velocity, control mode
      components/
        EStopButton.tsx           # Emergency stop
        VelocitySlider.tsx        # Linear/angular velocity
        DPad.tsx                  # Directional control

    map/                          # Map visualization domain
      stores/
        useMapStore.ts            # Grid data, robot poses
      services/
        OccupancyGridRenderer.ts  # Canvas rendering logic
        grid-worker.ts            # Web Worker for pixel conversion
      components/
        MapView.tsx               # Canvas container + overlay

    pilot/                        # Pilot/camera domain
      components/
        PilotView.tsx             # Camera feed + control overlay

  shared/
    components/                   # Shared UI components (Show, DataCard, etc.)
    hooks/                        # Shared hooks (useElementSize, etc.)
    types/                        # Global type definitions
    lib/                          # Utilities
```

### Cross-Domain Communication

```
FleetStore.selectRobot(id)
    |
    |--> ConnectionStore subscribes: connect if not connected
    |--> TelemetryStore subscribes: start receiving data for this robot
    |--> ControlStore subscribes: load control state for this robot
    |--> MapStore subscribes: fetch map if robot has mapping capability

Communication mechanism: Direct function calls between stores.
NOT events, NOT shared state, NOT React context.
```

Example:
```typescript
// In a component or effect that handles robot selection:
useEffect(() => {
  const robotId = useFleetStore.getState().selectedRobotId;
  if (robotId) {
    useConnectionStore.getState().connect(robotId, url);
    // Telemetry streams auto-start via useEffect in telemetry components
  }
}, [selectedRobotId]);
```

---

## Scalability Considerations

| Concern | 1 Robot | 5 Robots | 20 Robots |
|---------|---------|----------|-----------|
| WebSocket connections | 1 connection, trivial | 5 parallel connections, still manageable | Consider connection pooling or relay server |
| Telemetry throughput | ~10 topics at 10Hz = 100 msg/s | ~50 topics = 500 msg/s | Aggressive throttling needed, consider server-side aggregation |
| Memory (ring buffers) | 300 points x 10 topics = 3K points | 15K points, ~2MB | 60K points, ~8MB -- still fine |
| Canvas rendering | 1 map view | Render only selected robot's map | Same -- only active view renders |
| Zustand re-renders | Negligible | Selector isolation prevents cross-robot updates | Same pattern scales -- normalized Record<id, T> |

---

## Suggested Build Order

Dependencies flow strictly downward. Each layer must be testable before the next builds on it.

```
Phase 1: Foundation (Vite, React, TypeScript, test infra)
    |
Phase 2: Design system (tokens, theme, shared components)
    |
Phase 3: App shell (sidebar, header, content area)
    |
Phase 4: Router (routes wired to shell)
    |
Phase 5: Transport layer [CRITICAL PATH]
    |-- RosConnectionManager (WebSocket + reconnection)
    |-- TopicStreamFactory (Observable cache)
    |-- ConnectionStore (connection state)
    |-- ServiceCaller
    |
Phase 6: Fleet + selection
    |-- FleetStore
    |-- FleetOverview, RobotCard components
    |
Phase 7: Telemetry data layer + widgets
    |-- TelemetryStore + TelemetryRingBuffer
    |-- RxJS pipelines per data type
    |-- IMU, DataPlot widgets
    |
Phase 8: Widget-to-workspace wiring
    |-- Robot workspace layout
    |-- Widgets rendered in grid panels
    |
Phase 9: Control layer
    |-- ControlStore
    |-- E-Stop, velocity, D-pad components
    |-- Outbound command publishing
    |
Phase 10: Pilot view
    |-- Camera feed (compressed image topic)
    |-- Control overlay
    |
Phase 11: Map view
    |-- MapStore
    |-- OccupancyGridRenderer + Web Worker
    |-- Two-canvas stack
    |
Phase 12: Integration + polish
    |-- All routes verified end-to-end
    |-- E2E smoke tests
    |-- Visual polish pass
```

**Build order rationale:**
- Transport (Phase 5) before everything else because all data flows through it. It must be rock-solid and independently testable with mock rosbridge.
- Fleet (Phase 6) before telemetry because you need to select a robot before you can view its data.
- Telemetry widgets (Phase 7) before control (Phase 9) because read-only is simpler than read-write. Validate the inbound pipeline before adding outbound.
- Map (Phase 11) last among features because it has the highest complexity (Web Worker, canvas, large payloads) and the least dependency on other features.
- Each phase leaves the app working -- no "wire later" phases.

---

## Sources

- [roslibjs GitHub (transport API, events)](https://github.com/RobotWebTools/roslibjs) -- HIGH confidence (verified source code, no built-in reconnection)
- [roslib Ros class JSDoc](http://robotwebtools.org/jsdoc/roslibjs/current/Ros.html) -- HIGH confidence
- [WebSocket reconnection with exponential backoff](https://dev.to/hexshift/robust-websocket-reconnection-strategies-in-javascript-with-exponential-backoff-40n1) -- HIGH confidence (standard pattern)
- [RxJS scan operator (learnrxjs)](https://www.learnrxjs.io/learn-rxjs/operators/transformation/scan) -- HIGH confidence
- [RxJS throttleTime operator](https://www.learnrxjs.io/learn-rxjs/operators/filtering/throttletime) -- HIGH confidence
- [RxJS patterns for efficiency and performance](https://dev.to/gc_psk/rxjs-patterns-efficiency-and-performance-2i6m) -- MEDIUM confidence
- [Zustand multiple stores vs slices discussion](https://github.com/pmndrs/zustand/discussions/2496) -- HIGH confidence (official repo)
- [Zustand slices pattern docs](https://github.com/pmndrs/zustand/blob/main/docs/learn/guides/slices-pattern.md) -- HIGH confidence
- [Working with Zustand (TkDodo)](https://tkdodo.eu/blog/working-with-zustand) -- HIGH confidence (respected community source)
- [OffscreenCanvas web.dev guide](https://web.dev/articles/offscreen-canvas) -- HIGH confidence
- [Canvas pixel manipulation with typed arrays (Mozilla)](https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/) -- HIGH confidence
- [Canvas rendering optimization (ag-Grid)](https://blog.ag-grid.com/optimising-html5-canvas-rendering-best-practices-and-techniques/) -- MEDIUM confidence
- [OccupancyGrid message format (ROS docs)](http://docs.ros.org/en/noetic/api/nav_msgs/html/msg/OccupancyGrid.html) -- HIGH confidence
- [Using rosbridge with ROS2 (Foxglove)](https://foxglove.dev/blog/using-rosbridge-with-ros2) -- MEDIUM confidence
