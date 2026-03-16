# Architecture

**Analysis Date:** 2026-03-16

## Pattern Overview

**Overall:** Frontend SPA with Layered Feature-Module Architecture

**Key Characteristics:**

- Single-page React application with client-side routing
- Three-layer data architecture: roslib (transport) → RxJS (streams) → Zustand (UI state)
- Feature-module organization with self-contained domains
- Observable-driven reactive data flow
- Registry pattern for per-robot service instances

## Layers

**Presentation Layer (Views + Components):**

- Purpose: Route-level pages and reusable UI components
- Contains: View components, layout shells, shadcn/ui primitives, shared components
- Location: `src/views/`, `src/components/layout/`, `src/components/ui/`, `src/components/shared/`
- Depends on: Feature modules, stores
- Used by: Router

**Feature Module Layer:**

- Purpose: Domain-specific business logic, components, and hooks
- Contains: Self-contained feature directories with components/, hooks/, types, utils
- Location: `src/features/` (connections, control, fleet, panels, pilot-mode, recording, slam, telemetry)
- Depends on: Services, stores, types
- Used by: Views

**State Management Layer (Zustand):**

- Purpose: Reactive UI state with persistence
- Contains: Sliced stores for connections, ROS state, WebRTC state, control, layout, UI
- Location: `src/stores/`
- Depends on: Types
- Used by: Feature modules, components

**Service Layer:**

- Purpose: Singleton transport management and communication lifecycle
- Contains: ROS and WebRTC transport classes, service registries
- Location: `src/services/ros/`, `src/services/webrtc/`
- Depends on: roslib, WebRTC browser API, RxJS, config
- Used by: Feature hooks, stores (via bridge pattern)

**Types & Config Layer:**

- Purpose: Shared type definitions and application configuration
- Contains: ROS message types, connection types, config constants
- Location: `src/types/`, `src/config/`
- Depends on: Nothing
- Used by: All layers

## Data Flow

**Telemetry Data Flow (e.g., LiDAR scan):**

1. ROS robot publishes LaserScan messages over rosbridge WebSocket
2. `RosTransport` maintains WebSocket via roslib (`src/services/ros/RosTransport.ts`)
3. `TopicSubscriber` wraps roslib topic as RxJS Observable with throttle (`src/services/ros/TopicSubscriber.ts`)
4. Feature hook subscribes via `useObservable()` or direct subscription (`src/features/telemetry/lidar/hooks/useLidarData.ts`)
5. Hook transforms raw message → domain data (e.g., polar → cartesian points)
6. React component renders via Canvas 2D (`src/features/telemetry/lidar/hooks/useLidarCanvas.ts`)
7. Optionally: RecordingService taps stream → IndexedDB (`src/features/recording/recording.service.ts`)

**Robot Control Flow:**

1. User interacts with ControlWidget buttons (`src/features/control/components/ControlWidget.tsx`)
2. Actions update `control.store` (velocity, direction) (`src/stores/control.store.ts`)
3. `useControlPublisher` hook reads store, builds Twist message (`src/features/control/hooks/useControlPublisher.ts`)
4. `TopicPublisher` sends Twist to ROS topic (`src/services/ros/TopicPublisher.ts`)
5. Robot receives command via rosbridge → motor controller

**Connection Lifecycle:**

1. User adds robot via `ConnectionsSidebar` → `connections.store.addRobot()` → persisted to localStorage
2. User selects robot → `setActiveRobot()` triggers connection
3. `RosServiceRegistry` creates/reuses `RosTransport` for robot ID
4. Transport connects with auto-reconnect → emits `connectionState$` BehaviorSubject
5. `ros.store` updates per-robot connection state for UI consumption

**State Management:**

- Zustand stores: Serializable UI state with `persist` middleware → localStorage
- RxJS streams: High-frequency data (IMU/LiDAR) bypasses Zustand via `useObservable()` hook to prevent re-render floods
- Bridge pattern: `RxJS → Zustand` for data that React components need reactively

## Key Abstractions

**Transport (RosTransport, WebRTCTransport):**

- Purpose: Abstract connection lifecycle with retry logic
- Examples: `src/services/ros/RosTransport.ts`, `src/services/webrtc/WebRTCTransport.ts`
- Pattern: BehaviorSubject state emission, exponential backoff, generation counter for stale callbacks

**Service Registry (RosServiceRegistry, WebRTCServiceRegistry):**

- Purpose: Singleton managers for per-robot transport instances
- Examples: `src/services/ros/RosServiceRegistry.ts`, `src/services/webrtc/WebRTCServiceRegistry.ts`
- Pattern: Map<robotId, Transport> with create-on-first-access, proper cleanup

**Panel Registry:**

- Purpose: Declarative widget type system for dashboard panels
- Examples: `src/features/panels/panel.registry.ts`
- Pattern: Map of PanelTypeId → PanelMeta (title, icon, default size, component)

**Feature Module:**

- Purpose: Self-contained domain with components, hooks, types
- Examples: `src/features/telemetry/lidar/`, `src/features/control/`, `src/features/recording/`
- Pattern: `{feature}/components/`, `{feature}/hooks/`, `{feature}/index.ts` barrel export

## Entry Points

**Application:**

- Location: `index.html` → `src/main.tsx`
- Triggers: Browser page load
- Responsibilities: Create React root, render `<App />`

**App Component:**

- Location: `src/App.tsx`
- Triggers: React render
- Responsibilities: TooltipProvider + AppShell + Sonner toast

**Router:**

- Location: `src/router/index.tsx`
- Triggers: URL navigation
- Routes:
  - `/` → redirect to `/dashboard`
  - `/dashboard` → DashboardShell + DashboardView
  - `/fleet` → DashboardShell + FleetView
  - `/map` → DashboardShell + MapView
  - `/pilot/:robotId` → PilotView (fullscreen, no shell)
  - `*` → NotFoundView

## Error Handling

**Strategy:** RxJS error callbacks at subscription boundaries, Zustand error state per robot

**Patterns:**

- Transport services: Exponential backoff retry with max attempts, error state in BehaviorSubject
- Connection errors: Stored per-robot in `ros.store` and `webrtc.store` with message + timestamp
- Disconnect safety: `DisconnectGuard` in `DashboardShell.tsx` triggers e-stop on connection loss
- UI feedback: Sonner toast notifications for connection events
- Recording: `console.error` in hooks (should use structured logger)

## Cross-Cutting Concerns

**Logging:**

- Custom logger utility: `src/lib/logger.ts`
- Module-prefixed messages with environment-based log levels
- Note: Some features still use `console.error` directly

**Validation:**

- TypeScript strict mode enforces compile-time type safety
- No runtime schema validation (Zod not used)
- Input validated at component level (form inputs for robot connections)

**Authentication:**

- None — explicitly out of scope. Direct-connect model on local networks.

---

_Architecture analysis: 2026-03-16_
_Update when major patterns change_
