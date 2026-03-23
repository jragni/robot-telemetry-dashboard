# Feature Research

**Domain:** Robot Telemetry / Command & Control Dashboard (Browser-Based)
**Researched:** 2026-03-22
**Confidence:** HIGH (corroborated across Foxglove docs, RViz2 docs, defense C2 literature, and ROS teleoperation projects)

## Feature Landscape

### Table Stakes (Users Expect These)

Features every robot telemetry/C2 tool provides. Missing any of these and the dashboard feels like a toy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Real-time connection status | Every C2 tool shows connected/disconnected per robot. Operators need instant awareness of comms health. Foxglove, RViz2, Lattice all have this. | LOW | WebSocket readyState + heartbeat interval. Show latency ms alongside status. |
| Fleet overview with robot cards | Anduril Lattice has entity lists; Foxglove has data source info. Operators need at-a-glance fleet health before drilling in. | MEDIUM | Cards with name, status indicator (connected/warning/error), battery if available. Sort by status (errors first). |
| Live telemetry data display | The entire point of the tool. Foxglove has Raw Messages, Plot, Gauge, Indicator panels. RViz2 displays all sensor types. | MEDIUM | Subscribe to ROS topics, render numeric values with labels and units. Must handle varying publish rates (1Hz to 100Hz+). |
| Time-series plots | Foxglove Plot panel, RViz2 plotting plugins, every telemetry tool has this. Operators need trend visualization for IMU, motor currents, temperatures. | MEDIUM | Use a charting library (Recharts or similar). Must handle streaming append without memory leaks. Rolling window (last N seconds). |
| Camera feed display | Foxglove Image panel, RViz2 Camera display, Stretch web interface. Operators expect to see what the robot sees. | MEDIUM | CompressedImage or raw Image topic. Decode JPEG/PNG in browser. Handle frame drops gracefully. |
| E-Stop (Emergency Stop) | Safety-critical. Every teleoperation interface has this. FORT Robotics makes dedicated hardware E-Stop. Software E-Stop is minimum viable. PAL Robotics web UI includes it. | LOW | Publish to /emergency_stop topic. Must be the most prominent, always-accessible control. Red, large, impossible to miss. |
| Velocity/movement control | Foxglove Teleop panel, PAL Robotics web UI, Stretch web interface all provide this. Operators need to drive the robot. | MEDIUM | Publish geometry_msgs/Twist to /cmd_vel. D-pad for discrete directions, or virtual joystick. Must publish at steady rate while held. |
| Dark theme | Defense-contractor standard. Anduril Lattice, Palantir, every military C2 uses dark backgrounds to reduce eye strain in ops centers. | LOW | Already planned. OKLCH tokens make this straightforward. Dark is the PRIMARY theme for this domain. |
| Topic subscription management | Foxglove lets you pick which topics feed which panels. RViz2 has display list with topic mapping. Operators need to choose what data to see. | LOW | Dropdown or picker to select ROS topic for each widget. Auto-discover available topics via rosbridge. |
| Connection configuration | Every ROS tool requires specifying rosbridge URL. Must be easy to set and persist. | LOW | Settings panel with rosbridge WebSocket URL input. Persist in localStorage. |

### Differentiators (Competitive Advantage)

Features that separate this dashboard from "yet another RViz clone." The defense-contractor aesthetic itself is the biggest differentiator -- most ROS tools look like developer utilities, not operational software.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Defense-contractor visual aesthetic | Foxglove looks like a dev tool. RViz2 looks like a Qt app from 2010. This dashboard should look like it belongs at Anduril or Palantir -- grid panels, OKLCH dark blues, status indicators that feel operational. Resume-worthy visual polish is the core value proposition. | MEDIUM | Not a feature in the traditional sense, but THE differentiator. Every component must be styled intentionally. No default browser chrome. |
| Occupancy grid map rendering | Foxglove has a Map panel and 3D panel. RViz2 renders grids natively. Browser-based OccupancyGrid rendering with pan/zoom is uncommon in lightweight dashboards. | HIGH | Canvas-based rendering. OccupancyGrid messages can be large (1024x1024 at 8-bit = 1MB). On-demand fetch, not continuous stream. Already validated as the right approach (see bandwidth analysis in memory). |
| Pilot view (camera + control overlay) | Stretch web interface does this. Foxglove requires separate panels. A unified "pilot view" combining camera feed with translucent control overlay (velocity, heading, E-Stop) feels like a drone operator interface. | MEDIUM | Composite view: camera feed as background, HUD-style overlay with controls. Immersive toggle to go fullscreen. |
| Sidebar-driven navigation (Fleet > Robot > Detail) | Foxglove uses a flat panel layout. RViz2 has no fleet concept. Lattice has an entity list sidebar. A hierarchical sidebar that drills from fleet to individual robot to detail views is cleaner than tab/panel chaos. | MEDIUM | Already designed in IA redesign (v3). Three levels: fleet list, robot summary, detail panels (telemetry/pilot/map). |
| Light + dark theme toggle | Most defense tools are dark-only. Having a polished light theme too shows design maturity and supports different environments (bright field ops vs dark ops center). | LOW | System preference detection + manual toggle. Both themes must look equally intentional. |
| IMU 3D orientation visualization | Foxglove 3D panel can do this but requires config. A dedicated widget showing roll/pitch/yaw with a 3D robot model or attitude indicator (like an aircraft instrument) is immediately useful. | MEDIUM | Three.js or CSS 3D transforms for a simple orientation cube/model. Subscribe to IMU quaternion topic. |
| LiDAR scan visualization | Foxglove 3D panel renders point clouds. RViz2 has LaserScan display. A 2D top-down radar-style display of LaserScan data fits the defense aesthetic perfectly. | MEDIUM | Canvas-based polar plot. LaserScan messages have ranges array + angle_min/max/increment. Render as radial sweep. |
| Responsive design (desktop + mobile) | Foxglove is desktop-only. RViz2 is desktop-only. A mobile-functional version means operators can check fleet status from a phone in the field. | MEDIUM | Desktop-first grid layout. Mobile: bottom tab bar, swipeable cards, simplified views. Not full control on mobile -- monitoring only. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Drag-and-drop panel layout editor | Foxglove has this. Seems like a power feature. | Massive complexity (react-grid-layout caused ISS-008 infinite loop in v2). Layout persistence, responsive breakpoints, panel resize all add bugs. For a single-purpose dashboard (not a general visualization tool), fixed layouts are better. | Pre-designed layout per view (fleet overview, robot workspace, pilot view). Users don't need to rearrange -- they need views that work out of the box. |
| 3D point cloud rendering (WebGL) | Foxglove and RViz2 both do this. Seems essential. | WebGL 3D rendering is extremely complex in browser. Performance issues, GPU memory, shader management. Point cloud visualization requires depth buffering, camera controls, and handles millions of points. Massive scope. | 2D top-down LiDAR scan (radar-style) for v1. Covers 90% of use cases for ground robots. 3D is a v2+ feature if needed. |
| Bag file playback/recording | Foxglove's core feature. Data replay is powerful. | Requires a data management backend, file storage, timeline scrubbing UI, synchronization across topics. Completely different product scope. | Live-only for v1. This is an operational tool, not a data analysis tool. |
| Plugin/extension system | Foxglove supports custom User Scripts and extensions. Seems future-proof. | Massive architecture overhead. Plugin APIs, sandboxing, loading, versioning. v1 doesn't have enough users to justify this. | Hardcode the panels you need. Add new ones in code. When you have 10+ panel types, then consider plugins. |
| Multi-user collaboration | Defense C2 systems support multiple operators. Seems professional. | Requires a backend server, WebSocket sync, user auth, conflict resolution. Explicitly out of scope (single-operator tool). | Single operator. If needed later, add read-only viewer mode via URL sharing. |
| AI/ML anomaly detection | Modern C2 systems use AI for threat detection. Seems cutting-edge. | Requires ML models, training data, inference pipeline. Adds complexity without validating the core dashboard. Already marked out of scope. | Manual threshold alerts (if value > X, show warning). Simple conditional formatting covers 80% of the use case. |
| Full ROS2 parameter server integration | Foxglove has Parameters panel and Service Call panel. Power user feature. | Bidirectional parameter editing adds risk (operators could misconfigure robots remotely). Read-only telemetry is safer for v1. | Display parameters as read-only if useful. No remote parameter editing in v1. |
| Gamepad/joystick hardware support | Browser Gamepad API exists. Physical controllers feel professional. | Browser Gamepad API is inconsistent across browsers, requires polling, axis mapping varies per controller. Adds testing burden. | On-screen D-pad and virtual joystick. Works on any device. Add gamepad support as an enhancement later. |

## Feature Dependencies

```
[Connection Configuration]
    └──requires──> nothing (foundation)

[Real-time Connection Status]
    └──requires──> [Connection Configuration]

[Topic Discovery]
    └──requires──> [Real-time Connection Status]

[Fleet Overview]
    └──requires──> [Connection Configuration]
    └──requires──> [Real-time Connection Status]

[Live Telemetry Display]
    └──requires──> [Topic Discovery]
    └──requires──> [Real-time Connection Status]

[Time-Series Plots]
    └──requires──> [Live Telemetry Display]

[Camera Feed]
    └──requires──> [Topic Discovery]
    └──requires──> [Real-time Connection Status]

[E-Stop]
    └──requires──> [Real-time Connection Status]

[Velocity Control / D-pad]
    └──requires──> [Real-time Connection Status]

[Pilot View]
    └──requires──> [Camera Feed]
    └──requires──> [Velocity Control / D-pad]
    └──requires──> [E-Stop]

[Occupancy Grid Map]
    └──requires──> [Topic Discovery]
    └──requires──> [Real-time Connection Status]

[LiDAR Scan Visualization]
    └──requires──> [Topic Discovery]

[IMU 3D Orientation]
    └──requires──> [Live Telemetry Display]

[Sidebar Navigation]
    └──requires──> [Fleet Overview]

[Dark/Light Theme]
    └──requires──> nothing (infrastructure, parallel track)
```

### Dependency Notes

- **Pilot View requires Camera + Controls + E-Stop:** This is a composite view. All three sub-features must exist before the pilot view can be assembled. Build the parts first, then compose.
- **Everything requires Connection Status:** The rosbridge WebSocket connection is the foundation. Nothing works without it. This must be Phase 1.
- **Topic Discovery enables all data panels:** Auto-discovering available topics from rosbridge lets the UI populate dropdowns and validate subscriptions. Build once, used everywhere.
- **Theme is independent:** Can be built in parallel with any feature phase. Best done early so all subsequent components are built with theme tokens from the start.

## MVP Definition

### Launch With (v1)

The minimum set to demonstrate a working, visually polished robot C2 dashboard.

- [ ] Rosbridge WebSocket connection with status indicator -- foundation for everything
- [ ] Fleet overview with robot cards (name, status, last seen) -- first screen operators see
- [ ] Live telemetry display with numeric values (IMU data) -- proves real-time data flow
- [ ] Time-series plot for selected telemetry values -- trend visualization
- [ ] Camera feed display -- see what the robot sees
- [ ] E-Stop button -- safety-critical, must exist from day one
- [ ] Velocity control (D-pad or virtual joystick) -- basic robot movement
- [ ] Dark + light theme with toggle -- the aesthetic IS the product
- [ ] Sidebar navigation (Fleet > Robot > Detail) -- the IA that ties it together

### Add After Validation (v1.x)

Features to add once the core loop (connect, monitor, control) works end-to-end.

- [ ] Pilot view (camera + control overlay composite) -- once camera and controls work separately
- [ ] Occupancy grid map rendering -- high complexity, on-demand fetch pattern
- [ ] LiDAR scan visualization (2D radar-style) -- after telemetry pipeline is proven
- [ ] IMU 3D orientation widget -- after IMU data subscription works
- [ ] Responsive mobile layout -- after desktop layout is polished

### Future Consideration (v2+)

Features to defer until the core product is solid.

- [ ] 3D point cloud rendering (WebGL) -- massive scope, defer unless demand is clear
- [ ] Gamepad/joystick hardware support -- Browser Gamepad API, nice-to-have
- [ ] Data recording/export -- localStorage snapshots or CSV export of plot data
- [ ] Multi-robot simultaneous control -- UI for switching active control target
- [ ] Configurable alert thresholds -- when value > X, show warning

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Rosbridge connection + status | HIGH | LOW | P1 |
| Fleet overview cards | HIGH | MEDIUM | P1 |
| E-Stop | HIGH | LOW | P1 |
| Dark + light theme | HIGH | LOW | P1 |
| Sidebar navigation | HIGH | MEDIUM | P1 |
| Live telemetry display | HIGH | MEDIUM | P1 |
| Time-series plots | HIGH | MEDIUM | P1 |
| Camera feed | HIGH | MEDIUM | P1 |
| Velocity control (D-pad) | HIGH | MEDIUM | P1 |
| Pilot view (composite) | MEDIUM | MEDIUM | P2 |
| Occupancy grid map | MEDIUM | HIGH | P2 |
| LiDAR scan visualization | MEDIUM | MEDIUM | P2 |
| IMU 3D orientation | MEDIUM | MEDIUM | P2 |
| Responsive mobile | MEDIUM | MEDIUM | P2 |
| 3D point cloud (WebGL) | LOW | HIGH | P3 |
| Gamepad support | LOW | MEDIUM | P3 |
| Data export | LOW | LOW | P3 |

**Priority key:**
- P1: Must have for launch -- the demo doesn't work without it
- P2: Should have, add in subsequent phases -- enhances the product significantly
- P3: Nice to have, future consideration -- only if time permits

## Competitor Feature Analysis

| Feature | Foxglove Studio | RViz2 | Webviz (Cruise) | Anduril Lattice | Our Approach |
|---------|----------------|-------|-----------------|-----------------|--------------|
| Platform | Desktop app + web | Desktop only (Qt) | Web only (deprecated) | Desktop + tablet | Web only (browser) |
| Fleet management | No (single connection) | No (single robot) | No | Yes (entity lists, multi-select) | Yes -- fleet-first sidebar navigation |
| Panel layout | Drag-and-drop, user-configured | Fixed display list | Drag-and-drop panels | Fixed operational views | Fixed pre-designed views per context |
| 3D visualization | Full WebGL 3D scene | Full OpenGL 3D scene | WebGL 3D scene | Map + entity overlay | 2D only for v1 (LiDAR radar, occupancy grid) |
| Teleoperation | Teleop panel (virtual joystick) | No built-in control | No | Full C2 controls | D-pad + velocity sliders + E-Stop |
| Camera | Image panel (decode + annotate) | Camera display plugin | Image panel | Sensor feeds | Camera feed with pilot view overlay |
| Data replay | Core feature (bag files) | No | Core feature (bag files) | Mission replay | Not in v1 (live only) |
| Theme | Light only | System Qt theme | Light only | Dark (defense aesthetic) | Dark + light toggle |
| Visual polish | Developer tool aesthetic | 2010s Qt aesthetic | Developer tool aesthetic | Military-grade polish | Defense-contractor aesthetic (the differentiator) |
| Mobile | No | No | No | Tablet (PVI) | Responsive (monitoring mode) |
| Extensibility | User scripts, extensions | Plugins (C++) | Custom panels (React) | Lattice SDK | Hardcoded panels (v1) |

## Key Insight: Where We Win

The competitive landscape breaks into two camps:

1. **Developer tools** (Foxglove, RViz2, Webviz): Powerful but look like dev tools. Flexible but require configuration. No fleet management. No operational aesthetic.

2. **Defense platforms** (Lattice, Palantir): Beautiful and operational but proprietary, expensive, and not available for indie robotics. Overkill for single-team use.

Our dashboard sits in the gap: **operational polish of a defense C2 system, accessible as a browser tab, focused on the single-team robotics operator.** We don't compete on features (Foxglove has 23 panel types). We compete on cohesion, aesthetic, and the "open it and it works" experience.

## Sources

- [Foxglove Panels Documentation](https://docs.foxglove.dev/docs/visualization/panels)
- [Foxglove Product Page](https://foxglove.dev/product)
- [Foxglove Layouts Documentation](https://docs.foxglove.dev/docs/visualization/layouts)
- [RViz2 User Guide - ROS 2 Humble](https://docs.ros.org/en/humble/Tutorials/Intermediate/RViz/RViz-User-Guide/RViz-User-Guide.html)
- [Webviz GitHub - Cruise Automation](https://github.com/cruise-automation/webviz)
- [Anduril Lattice Command & Control](https://www.anduril.com/lattice/command-and-control)
- [Anduril Lattice SDK](https://www.anduril.com/lattice-sdk/)
- [PAL Robotics Web Teleoperation UI](https://pal-robotics.com/blog/web-user-interface-how-to-teleoperate-your-robot/)
- [Hello Robot Stretch Web Interface](https://github.com/hello-robot/stretch_web_interface)
- [Transitive Robotics Remote Teleop](https://transitiverobotics.com/caps/transitive-robotics/remote-teleop/)
- [Visual Logic Military UX Design](https://visuallogic.com/military-ux/)
- [Palantir Foundry Dashboards](https://www.palantir.com/docs/foundry/analytics/dashboards)

---
*Feature research for: Robot Telemetry / Command & Control Dashboard*
*Researched: 2026-03-22*
