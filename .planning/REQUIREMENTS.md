# Requirements — Robot Telemetry Dashboard v4

**Total:** 19 requirements across 7 domains
**Scoped by:** User (2026-03-23)
**Source:** PROJECT.md + research/SUMMARY.md + user feature scoping session

---

## Connection (CONN)

| ID      | Requirement                                                                             | Priority | Phase   |
| ------- | --------------------------------------------------------------------------------------- | -------- | ------- |
| CONN-01 | Connection config — rosbridge URL input with localStorage persistence                   | Must     | Phase 5 |
| CONN-02 | Real-time connection status with latency indicator on robot cards                       | Must     | Phase 5 |
| CONN-03 | Auto-reconnection with exponential backoff + subscription re-establishment on reconnect | Must     | Phase 5 |
| CONN-04 | Auto-discover available ROS topics via rosbridge introspection                          | Should   | Phase 7 |

## Fleet (FLEET)

| ID       | Requirement                                                | Priority | Phase   |
| -------- | ---------------------------------------------------------- | -------- | ------- |
| FLEET-01 | Robot cards with name, status indicator, and battery level | Must     | Phase 6 |
| FLEET-02 | Simultaneous multi-robot monitoring (2-5 robots)           | Must     | Phase 6 |

## Telemetry (TELE)

| ID      | Requirement                                                    | Priority | Phase   |
| ------- | -------------------------------------------------------------- | -------- | ------- |
| TELE-01 | IMU orientation widget displaying roll, pitch, yaw             | Should   | Phase 7 |
| TELE-02 | Streaming time-series plots with configurable rolling window   | Must     | Phase 7 |
| TELE-03 | 2D top-down LiDAR scan radar-style display (Canvas polar plot) | Should   | Phase 7 |
| TELE-04 | Raw topic values displayed as formatted key/value pairs        | Must     | Phase 7 |

## Control (CTRL)

| ID      | Requirement                                                                                      | Priority | Phase    |
| ------- | ------------------------------------------------------------------------------------------------ | -------- | -------- |
| CTRL-01 | E-Stop — large red button, always accessible from any view within one click                      | Must     | Phase 9  |
| CTRL-02 | Velocity control — D-pad + sliders publishing geometry_msgs/Twist to /cmd_vel at 10Hz rate limit | Must     | Phase 9  |
| CTRL-03 | Camera feed display from CompressedImage topic with frame rate cap                               | Should   | Phase 10 |

## Views (VIEW)

| ID      | Requirement                                                       | Priority | Phase    |
| ------- | ----------------------------------------------------------------- | -------- | -------- |
| VIEW-01 | Fleet overview at `/` with robot cards grid                       | Must     | Phase 6  |
| VIEW-02 | Robot workspace at `/robot/:id` with telemetry panels + controls  | Must     | Phase 8  |
| VIEW-03 | Pilot view at `/pilot/:id` with camera feed + HUD control overlay | Should   | Phase 10 |
| VIEW-04 | Map view at `/map` with occupancy grid rendering + robot markers  | Should   | Phase 11 |

## Design (DSGN)

| ID      | Requirement                                                                                     | Priority | Phase    |
| ------- | ----------------------------------------------------------------------------------------------- | -------- | -------- |
| DSGN-01 | Light/dark theme toggle with system preference detection and localStorage persistence           | Must     | Phase 2  |
| DSGN-02 | Defense-contractor aesthetic — OKLCH tokens, grid panels, Anduril/Palantir-inspired, no AI slop | Must     | Phase 2  |
| DSGN-03 | Responsive mobile layout — monitoring-only (bottom tab bar, swipeable cards, no full control)   | Should   | Phase 12 |

## Shell (SHELL)

| ID       | Requirement                                                     | Priority | Phase   |
| -------- | --------------------------------------------------------------- | -------- | ------- |
| SHELL-01 | Sidebar-driven navigation with Fleet > Robot > Detail hierarchy | Must     | Phase 3 |
| SHELL-02 | App shell with collapsible sidebar + header + main content area | Must     | Phase 3 |

---

## Out of Scope (v4)

| Item                       | Rationale                                                                   |
| -------------------------- | --------------------------------------------------------------------------- |
| AI/ML features             | Adds complexity without core value; defer to v2+                            |
| User authentication        | Single-operator tool; no multi-user requirement                             |
| Backend server             | Client-only; connects directly to rosbridge WebSocket                       |
| Mobile-native app          | Web-responsive is sufficient for monitoring use case                        |
| Real-time collaboration    | Explicitly out of scope (single-operator)                                   |
| Bag file playback          | Anti-feature — massive scope, requires backend                              |
| Drag-and-drop panel layout | Anti-feature from research — caused ISS-008 in v2; fixed views serve better |
| 3D point cloud rendering   | GPU complexity; defer to v2+                                                |
| Plugin/extension system    | Anti-feature — premature abstraction                                        |
| Gamepad/joystick hardware  | Browser Gamepad API inconsistency; defer to v2+                             |
| Fleet sorting by status    | Nice-to-have; not v1                                                        |
| ROS2 parameter editing     | Anti-feature — dangerous in production                                      |
| Data recording/export      | Requires backend scope                                                      |

---

## Traceability

Phase numbers below reference the old GSD numbering from initial planning.
Actual implementation phases are tracked in ROADMAP.md.

| Requirement | Phase        | Status  | Notes                                                                         |
| ----------- | ------------ | ------- | ----------------------------------------------------------------------------- |
| CONN-01     | 06-fleet     | Partial | Connection store exists, URL input in AddRobotModal, localStorage persistence |
| CONN-02     | —            | Pending | Mock status on cards, no real latency indicator yet                           |
| CONN-03     | —            | Pending | No roslib connection wired yet                                                |
| CONN-04     | —            | Pending | Deferred                                                                      |
| FLEET-01    | 06-fleet     | ✅ Done | RobotCard with 6 subcomponents, status badge, color system                    |
| FLEET-02    | 06-fleet     | Partial | Cards render for multiple robots, no real connections yet                     |
| TELE-01     | 07-workspace | Partial | IMU mock panel with attitude indicator + compass, no real data                |
| TELE-02     | 07-workspace | Partial | Mock telemetry chart panel, no real streaming                                 |
| TELE-03     | 07-workspace | Partial | Mock LiDAR canvas panel, no real data                                         |
| TELE-04     | —            | Pending | Raw topic display deferred                                                    |
| CTRL-01     | 07-workspace | Partial | Mock E-Stop in workspace grid, no real publishing                             |
| CTRL-02     | 07-workspace | Partial | Mock D-pad + sliders, no real cmd_vel publishing                              |
| CTRL-03     | —            | Pending | Camera feed deferred                                                          |
| VIEW-01     | 06-fleet     | ✅ Done | Fleet overview at /fleet with robot cards grid                                |
| VIEW-02     | 07-workspace | Partial | Workspace at /robot/:id with mock panels                                      |
| VIEW-03     | —            | Pending | Pilot mode deferred (ComingSoon placeholder)                                  |
| VIEW-04     | —            | Pending | Map view deferred (ComingSoon placeholder)                                    |
| DSGN-01     | 02-design    | ✅ Done | Dark/light toggle, defaults to dark (no system preference)                    |
| DSGN-02     | 02-design    | ✅ Done | Midnight Operations OKLCH tokens, defense aesthetic                           |
| DSGN-03     | —            | Pending | Mobile responsive deferred                                                    |
| SHELL-01    | 03-app-shell | ✅ Done | Sidebar with Fleet > Robot hierarchy, store-driven                            |
| SHELL-02    | 03-app-shell | ✅ Done | Collapsible sidebar + header + content + statusbar                            |

**Coverage:** 22/22 requirements mapped. 6 done, 8 partial (mocked), 8 pending.

---

_Updated: 2026-03-30_
