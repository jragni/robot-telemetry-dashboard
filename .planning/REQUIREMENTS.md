# Requirements — Robot Telemetry Dashboard v4

**Total:** 19 requirements across 7 domains
**Scoped by:** User (2026-03-23)
**Source:** PROJECT.md + research/SUMMARY.md + user feature scoping session

---

## Connection (CONN)

| ID | Requirement | Priority | Phase |
|----|------------|----------|-------|
| CONN-01 | Connection config — rosbridge URL input with localStorage persistence | Must | — |
| CONN-02 | Real-time connection status with latency indicator on robot cards | Must | — |
| CONN-03 | Auto-reconnection with exponential backoff + subscription re-establishment on reconnect | Must | — |
| CONN-04 | Auto-discover available ROS topics via rosbridge introspection | Should | — |

## Fleet (FLEET)

| ID | Requirement | Priority | Phase |
|----|------------|----------|-------|
| FLEET-01 | Robot cards with name, status indicator, and battery level | Must | — |
| FLEET-02 | Simultaneous multi-robot monitoring (2-5 robots) | Must | — |

## Telemetry (TELE)

| ID | Requirement | Priority | Phase |
|----|------------|----------|-------|
| TELE-01 | IMU orientation widget displaying roll, pitch, yaw | Should | — |
| TELE-02 | Streaming time-series plots with configurable rolling window | Must | — |
| TELE-03 | 2D top-down LiDAR scan radar-style display (Canvas polar plot) | Should | — |
| TELE-04 | Raw topic values displayed as formatted key/value pairs | Must | — |

## Control (CTRL)

| ID | Requirement | Priority | Phase |
|----|------------|----------|-------|
| CTRL-01 | E-Stop — large red button, always accessible from any view within one click | Must | — |
| CTRL-02 | Velocity control — D-pad + sliders publishing geometry_msgs/Twist to /cmd_vel at 10Hz rate limit | Must | — |
| CTRL-03 | Camera feed display from CompressedImage topic with frame rate cap | Should | — |

## Views (VIEW)

| ID | Requirement | Priority | Phase |
|----|------------|----------|-------|
| VIEW-01 | Fleet overview at `/` with robot cards grid | Must | — |
| VIEW-02 | Robot workspace at `/robot/:id` with telemetry panels + controls | Must | — |
| VIEW-03 | Pilot view at `/pilot/:id` with camera feed + HUD control overlay | Should | — |
| VIEW-04 | Map view at `/map` with occupancy grid rendering + robot markers | Should | — |

## Design (DSGN)

| ID | Requirement | Priority | Phase |
|----|------------|----------|-------|
| DSGN-01 | Light/dark theme toggle with system preference detection and localStorage persistence | Must | — |
| DSGN-02 | Defense-contractor aesthetic — OKLCH tokens, grid panels, Anduril/Palantir-inspired, no AI slop | Must | — |
| DSGN-03 | Responsive mobile layout — monitoring-only (bottom tab bar, swipeable cards, no full control) | Should | — |

## Shell (SHELL)

| ID | Requirement | Priority | Phase |
|----|------------|----------|-------|
| SHELL-01 | Sidebar-driven navigation with Fleet → Robot → Detail hierarchy | Must | — |
| SHELL-02 | App shell with collapsible sidebar + header + main content area | Must | — |

---

## Out of Scope (v4)

| Item | Rationale |
|------|-----------|
| AI/ML features | Adds complexity without core value; defer to v2+ |
| User authentication | Single-operator tool; no multi-user requirement |
| Backend server | Client-only; connects directly to rosbridge WebSocket |
| Mobile-native app | Web-responsive is sufficient for monitoring use case |
| Real-time collaboration | Explicitly out of scope (single-operator) |
| Bag file playback | Anti-feature — massive scope, requires backend |
| Drag-and-drop panel layout | Anti-feature from research — caused ISS-008 in v2; fixed views serve better |
| 3D point cloud rendering | GPU complexity; defer to v2+ |
| Plugin/extension system | Anti-feature — premature abstraction |
| Gamepad/joystick hardware | Browser Gamepad API inconsistency; defer to v2+ |
| Fleet sorting by status | Nice-to-have; not v1 |
| ROS2 parameter editing | Anti-feature — dangerous in production |
| Data recording/export | Requires backend scope |

---

## Traceability

Phase mapping will be populated by the roadmapper. Every v1 requirement must map to exactly one phase. No requirement may span multiple phases.

---
*Generated: 2026-03-23*
