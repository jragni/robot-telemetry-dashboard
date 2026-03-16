# Architecture

**Analysis Date:** 2026-03-15

## Pattern Overview

**Overall:** React SPA with Context-Driven, Hooks-Based Architecture

**Key Characteristics:**
- Single Page Application (no server-side rendering)
- Context providers for global state management (ROS, WebRTC, Control, LidarZoom)
- Custom hooks as data integration layer between contexts and components
- Feature-scoped component organization
- Real-time bidirectional communication with robots

## Layers

**Presentation Layer:**
- Purpose: Render UI components and handle user interactions
- Contains: React components, layouts, UI primitives
- Location: `src/components/`, `src/layouts/`
- Depends on: State management layer (contexts via hooks)
- Used by: End users via browser

**State Management Layer:**
- Purpose: Manage global application state and connection lifecycle
- Contains: React Context providers with state, actions, and derived values
- Location: `src/contexts/ros/`, `src/contexts/webrtc/`, `src/contexts/control/`, `src/contexts/lidar-zoom/`
- Depends on: Data integration layer (hooks), configuration
- Used by: Presentation layer via context hooks

**Data Integration Layer:**
- Purpose: Bridge between application state and external systems (ROS, WebRTC)
- Contains: Custom React hooks managing connections, subscriptions, publications
- Location: `src/hooks/ros/`, `src/hooks/webrtc/`, `src/hooks/control/`
- Depends on: External libraries (roslib, WebRTC APIs), configuration
- Used by: State management layer (contexts)

**Configuration Layer:**
- Purpose: Connection parameters, retry logic, default values
- Contains: TypeScript config objects
- Location: `src/config/ros.ts`, `src/config/webrtc.ts`
- Depends on: Nothing
- Used by: Data integration layer

**Library/Utility Layer:**
- Purpose: Shared helpers, signaling client, UI utilities
- Contains: WebRTC signaling client, class utilities, global helpers
- Location: `src/lib/`, `src/utils/`
- Depends on: External APIs (fetch, WebRTC)
- Used by: Data integration layer, presentation layer

## Data Flow

**Robot Connection Flow:**

1. User adds robot URL in `ConnectionsSidebar.tsx`
2. `RosContext` stores connection in localStorage
3. User clicks "Connect" in `DashboardLayout.tsx`
4. `RosContext.connect()` -> `useRos` creates `ROSLIB.Ros` WebSocket instance
5. `WebRTCContext.connect()` -> `useWebRTC` creates `RTCPeerConnection`
6. Connection states propagate through contexts to all components

**Telemetry Subscription Flow (Robot -> Dashboard):**

1. ROS topic published on robot (e.g., `/imu`, `/scan`)
2. rosbridge_suite forwards via WebSocket
3. `useSubscriber<T>` hook receives message, casts to typed interface
4. Component state updated (e.g., `IMUCard`, `LidarCard`)
5. D3.js visualizations re-render with new data

**Control Command Flow (Dashboard -> Robot):**

1. User presses direction button in `ControlPanel.tsx`
2. `ControlContext.sendTwistCommand()` constructs `geometry_msgs/Twist`
3. `usePublisher` hook publishes via `ROSLIB.Topic`
4. Message sent over WebSocket to rosbridge
5. Robot receives and executes movement command

**Video Stream Flow:**

1. `WebRTCContext` triggers connection via `useWebRTC`
2. `SignalingClient` exchanges SDP offer/answer via REST (`src/lib/webrtc/signaling.ts`)
3. `RTCPeerConnection.ontrack` fires with `MediaStream`
4. `WebRTCVideo.tsx` renders stream in `<video>` element

**State Management:**
- Connection state: React Context (in-memory)
- Robot configurations: Browser localStorage (persistent)
- Theme preference: Browser localStorage (persistent)
- No server-side state

## Key Abstractions

**Context Provider:**
- Purpose: Encapsulate domain-specific global state
- Examples: `RosContext`, `WebRTCContext`, `ControlContext`, `LidarZoomContext`
- Pattern: createContext + Provider component + useContext hook
- Convention: Each throws error if used outside Provider

**Generic Subscriber/Publisher Hooks:**
- Purpose: Type-safe ROS topic communication
- Examples: `useSubscriber<ImuMessage>`, `usePublisher<TwistMessage>`
- Pattern: Generics with `<T = unknown>` default
- Features: Conditional enabling, throttling, cleanup on unmount

**Signaling Client:**
- Purpose: WebRTC SDP exchange abstraction
- Location: `src/lib/webrtc/signaling.ts`
- Pattern: Event emitter with typed events
- Features: Server availability check, connection timeout

**Feature Module:**
- Purpose: Self-contained domain (IMU, LiDAR, Control, etc.)
- Structure: Main component + sub-components + definitions.ts + helpers.ts
- Pattern: Each feature owns its types and helpers

## Entry Points

**Application Entry:**
- Location: `src/main.tsx`
- Triggers: Browser loads `index.html`
- Responsibilities: Mount React app to DOM

**Root Component:**
- Location: `src/App.tsx`
- Triggers: React render
- Responsibilities: Context provider tree (ThemeProvider -> RosProvider -> WebRTCProvider -> ControlProvider -> LidarZoomProvider), layout routing

**Main Layout:**
- Location: `src/layouts/DashboardLayout.tsx`
- Triggers: App render
- Responsibilities: Dashboard vs Pilot Mode switching, connection orchestration, responsive layout

## Error Handling

**Strategy:** Hook-level error capture with context-level state propagation and user-facing toasts

**Patterns:**
- Connection errors: State set to `'error'`, toast notification via Sonner
- Hook errors: `{ error, loading }` return pattern
- Async errors: try-catch in hooks, console.error for debugging
- Reconnection: Automatic retry with configurable limits (3 attempts)

## Cross-Cutting Concerns

**Logging:**
- Console.log/warn/error throughout hooks (development-oriented)
- Sonner toast notifications for user-facing messages
- No structured logging framework

**Validation:**
- TypeScript type casting for ROS messages (no runtime validation)
- Connection URL validation in UI

**Theme:**
- next-themes with dark/light/system modes
- CSS custom properties via Tailwind
- Persisted in localStorage

**Responsiveness:**
- `use-mobile` hook for breakpoint detection
- Resizable panels (desktop) vs stacked layout (mobile)
- Separate pilot mode layouts for desktop/mobile

---

*Architecture analysis: 2026-03-15*
*Update when major patterns change*
