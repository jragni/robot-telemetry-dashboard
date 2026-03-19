# Project Context — Robot Telemetry Dashboard v2

## What This Is

A ground-up v2 rebuild of a robot telemetry dashboard for monitoring, visualizing, and controlling
ROS2 robots in real-time. Defense-contractor aesthetic (Anduril/Palantir-inspired), modular panel
system, simultaneous multi-robot support, FPOV pilot mode, SLAM visualization.

## Why v2 Exists (v1 Problems)

v1 collapsed due to:

- Context provider sprawl (4 nested contexts tangled together)
- Tight component-to-context coupling making reuse impossible
- Inconsistent file organization with many empty placeholder files
- Zero test coverage
- 52+ console.log statements left in production code
- Fragile roslib CommonJS workaround

What worked in v1 (ported forward): ROS/WebRTC communication patterns, basic sensor
visualization, responsive layout concept, button-based controls.

## Target User

Robot operator who monitors and controls robots from desktop or mobile — and occasionally
demos the system. UI must look professional enough to impress.

## Robot Environment

- ROS2 Humble on Ubuntu
- rosbridge_suite for WebSocket communication
- Custom aiortc WebRTC server for video
- Nginx reverse proxy
- Primarily local network operation

## Design System

- **Aesthetic**: Defense-contractor — dark charcoal background, electric blue accents
- **Color system**: OKLCH color palette with CSS custom properties
- **Typography**: Inter (body) + IBM Plex Mono (data/code)
- **Components**: shadcn/ui (Radix primitives) themed to defense aesthetic
- **Icons**: Lucide React
- **Toasts**: Sonner

## Multi-Robot Architecture

- Designed for 2-5 robots, architecture supports up to 8 (hook slot limit)
- Per-robot singleton transports via Registry pattern
- Fleet overview with aggregated status cards
- Split pilot views for simultaneous control
- Unified command mode for swarm-style broadcasting
- 8-robot hard limit due to fixed React hook slot pattern

## Data Flow Patterns

### Telemetry (e.g., LiDAR scan)

1. ROS robot publishes LaserScan over rosbridge WebSocket
2. RosTransport maintains WebSocket via roslib
3. TopicSubscriber wraps as RxJS Observable with throttle
4. Feature hook subscribes via useObservable()
5. Hook transforms raw message -> domain data
6. Component renders via Canvas 2D
7. Optional: RecordingService taps stream -> IndexedDB

### Robot Control

1. User interacts with ControlWidget buttons
2. Actions update control.store (velocity, direction)
3. useControlPublisher builds Twist message
4. TopicPublisher sends to ROS topic
5. Robot receives via rosbridge -> motor controller

### Connection Lifecycle

1. User adds robot via ConnectionsSidebar -> connections.store
2. User selects robot -> triggers connection
3. RosServiceRegistry creates/reuses RosTransport
4. Transport connects with auto-reconnect -> emits connectionState$
5. ros.store updates per-robot state for UI

## Out of Scope (v2)

- 3D visualization (Three.js/WebGL)
- User authentication/accounts
- Chatbot/AI control
- Internationalization
- Custom backend/server
- Sensor fusion
- Alerting/threshold monitoring
- Waypoint navigation / path planning
- Keyboard shortcuts system
