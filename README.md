# Robot Telemetry Dashboard

Real-time telemetry dashboard for ROS 2 robots over rosbridge WebSocket.

**Live demo:** [jragni.github.io/robot-telemetry-dashboard](https://jragni.github.io/robot-telemetry-dashboard/)

<!-- TODO: Add dashboard screenshot with live robot data -->

## What It Does

Connects to one or more ROS 2 robots via rosbridge WebSocket to render live sensor data, publish velocity commands, and stream camera feeds over WebRTC. Panels include canvas-rendered LiDAR point clouds, IMU attitude wireframes, multi-topic telemetry graphs, a computation graph viewer, and a fullscreen pilot mode with HUD overlays. Fleet management handles connection lifecycle, topic discovery, and per-robot topic selection.

## Tech Stack

React 19, TypeScript 5.9, Vite 7, Tailwind CSS v4, shadcn/ui, Zustand, roslib 2.x, Zod v4, Vitest, Playwright

## Design Decisions

**Canvas 2D over Recharts/SVG for LiDAR and telemetry.** SVG re-renders the entire DOM subtree on every frame at 10-20Hz. Canvas 2D with a RAF loop and ring buffer renders thousands of LiDAR points without touching the React tree. The ring buffer provides O(1) append/evict for time-series data.

**Zustand over Redux and React Context.** No Provider wrapping, no action boilerplate. Selector-based subscriptions prevent unnecessary re-renders. Persist middleware handles localStorage serialization for robot fleet state across sessions.

**Class singleton for ConnectionManager.** A module-level singleton manages the Map of robotId to Ros instances. Handles WebSocket lifecycle, reconnection with exponential backoff (2s base, 30s cap, 5 attempts), and pushes connection status to the Zustand store. Keeps WebSocket concerns out of React components entirely.

**roslib + CBOR compression.** rosbridge serializes everything as JSON, inflating float arrays roughly 5x on the wire. Enabling CBOR binary encoding on the rosbridge server reduces bandwidth 40-70% for sensor data. The dashboard runs a normalizeCborMessage pass to coerce TypedArrays to plain arrays and NaN values to null before Zod validation.

**OKLCH color system.** All theme tokens use OKLCH with hue locked at 250. Perceptually uniform lightness means status colors (green/amber/red) maintain consistent visual weight. Tokens are registered via Tailwind v4's @theme inline directive so utility classes resolve to CSS custom properties.

## Architecture

```
Robot (ROS 2) ── rosbridge_server ── WebSocket ──> Browser
```

Data flow through the dashboard:

```
roslib Topic.subscribe()
  -> CBOR decode (if enabled)
  -> normalizeCborMessage (TypedArray/NaN coercion)
  -> Zod schema validation
  -> Zustand store update
  -> React panel re-render (selector subscription)
```

Three layers with strict boundaries:

1. **ConnectionManager** (module singleton) -- holds live Ros instances, owns WebSocket lifecycle, pushes status to store
2. **Zustand stores** (serializable state) -- robots, connection status, selected topics, panel minimization, persisted to localStorage
3. **React components** (read-only consumers) -- read store via selectors, subscribe to ROS topics via hooks, render to Canvas 2D or shadcn/ui

Panels own their subscriptions. Each panel receives a ros instance and topic name, then calls its own subscription hook internally. The workspace component is a layout orchestrator, not a data coordinator.

## Testing

476 unit tests (Vitest), 20 integration tests (Playwright with fake rosbridge), 43 smoke tests across 5 viewports.

Integration tests use Playwright's `page.routeWebSocket()` to intercept rosbridge protocol at the WebSocket level. A fake rosbridge server responds to subscribe/advertise operations and pushes JSON fixtures through the pipeline, verifying data flows from wire format through Zod validation to rendered UI.

Smoke tests run at 1920x1080, 1280x800, 1024x768, 768x1024, and 375x812. They check route rendering, layout overflow, and viewport-specific component visibility.

```bash
npm run test              # unit tests
npm run test:integration  # Playwright integration
npm run test:smoke        # Playwright 5-viewport smoke
```

## Known Limitations

- WebRTC video streaming requires same-network access or a TURN relay for cellular connections
- rosbridge JSON serialization inflates float arrays roughly 5x compared to binary (mitigated by CBOR, but not eliminated)
- Pilot mode operates on a single robot at a time -- fleet-wide pilot control is not implemented
- LiDAR visualization assumes single-echo LaserScan messages (no multi-echo support)
- Canvas 2D panels resolve CSS custom properties via getComputedStyle on every theme change, since Canvas cannot read CSS variables directly

## Getting Started

```bash
git clone https://github.com/jragni/robot-telemetry-dashboard.git
cd robot-telemetry-dashboard
npm install
npm run dev
```

Open http://localhost:5173, click Add Robot, enter the robot's rosbridge URL.

The robot needs [rosbridge_server](https://github.com/RobotWebTools/rosbridge_suite) running. For camera streaming, see [ros-webrtc](https://github.com/jragni/ros-webrtc). Full robot setup instructions are in `docs/`.

## License

MIT
