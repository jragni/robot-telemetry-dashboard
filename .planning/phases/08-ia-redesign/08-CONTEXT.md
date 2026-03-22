# Phase 8: Information Architecture Redesign - Context

**Gathered:** 2026-03-22
**Status:** Ready for research + planning

<vision>
## How This Should Work

The app currently has an identity crisis — two navbars, duplicate "Dashboard" labels, and modes within pages. This redesign strips all of that and replaces it with a single, clean navigation pattern that every professional robot dashboard uses: **sidebar-driven Fleet → Robot → Detail drill-down**.

**One sidebar. One way to navigate. No confusion.**

When you open the app, you see a sidebar on the left with your fleet (list of robots), a Map option, a Settings option, and a theme dropdown. The main content area changes based on what you select in the sidebar.

**No robot selected:** The main area shows the fleet overview — all robots, their status, health at a glance.

**Click a robot:** Main area becomes a customizable Foxglove/Grafana-style workspace for that robot. Video, telemetry widgets, controls, topic explorer — all arrangeable. Add widgets with [+], drag to resize, save layouts.

**Click Map:** Main area shows the shared SLAM map with all robots plotted. Click a robot dot on the map to drill into its detail view.

**Header is minimal:** Just the app title on the left, active robot name + battery + connection status on the right. No nav links in the header (sidebar handles all navigation).

**Sidebar features:**

- Fleet list with robot status indicators (connected/disconnected, battery)
- Map shortcut
- Theme dropdown (multiple dark themes: Default Dark, OLED Black, Military Green, Ocean Blue)
- Settings
- Resizable width (drag the sidebar edge)

**What gets REMOVED:**

- Top header nav bar (Dashboard | Fleet | Map)
- Mode switcher bar (DASHBOARD | PILOT | ENGINEER)
- Bottom mobile tab bar (mobile gets a different treatment)
- Separate Fleet page and Map page (they're sidebar items now, not pages)

**What gets KEPT:**

- All existing telemetry widgets (IMU, LiDAR, Topic List, Data Plot, Depth Camera)
- Robot control components (ControlPad, VelocitySliders, EStop, TopicSelector)
- Panel system (react-grid-layout for customizable workspace)
- Dark theme design system
- All ROS services and stores

</vision>

<essential>
## What Must Be Nailed

- **ONE navigation surface** — sidebar only. No duplicate navbars. No mode switcher. No bottom tabs (on desktop). When someone opens the app, there is exactly ONE way to navigate.
- **Fleet → Robot → Detail drill-down** — the information hierarchy that every professional robot dashboard uses. Fleet is home. Click a robot to see its detail. Everything flows from this pattern.
- **Customizable robot workspace** — when viewing a robot, the main area is a Foxglove-style panel grid where users arrange widgets. Save layouts. Add/remove panels.
- **Purpose-built for robot ops** — every screen answers: "What are my robots doing? Are they healthy? Do I need to intervene?"

</essential>

<boundaries>
## What's Out of Scope

- No new features — restructure existing components into the new hierarchy only
- No WebRTC video implementation — that's Phase 9
- No SLAM map implementation — that's Phase 12
- No fleet management features — that's Phase 11
- Theme dropdown UI can be built, but the actual theme variations (OLED Black, Military Green, Ocean Blue) are future work — just the default dark theme for now with the dropdown scaffolded
- No mobile redesign in this phase — focus on desktop sidebar-driven layout

</boundaries>

<specifics>
## Specific Ideas

- Sidebar is resizable (drag the right edge to make it wider/narrower)
- Theme dropdown in sidebar footer area (below Settings)
- Header shows active robot: `[🤖 RTD]          [Bot-1] [🔋 87%] [📡 OK]`
- Map in sidebar is a shortcut that shows shared SLAM map with all robot positions
- Clicking a robot dot on the map drills into that robot's detail view
- Robot detail view preserves the Foxglove-style panel grid from Engineer mode
- Remove DashboardMode, PilotMode, EngineerMode — replace with one unified robot detail view
- Router simplifies: `/` → fleet overview, `/robot/:id` → robot detail, `/map` → shared map

</specifics>

<notes>
## Additional Context

**Research-informed decisions:**

- SIFT, Formant, InOrbit, Freedom Robotics ALL use Fleet → Robot → Detail hierarchy
- Professional dashboards use role-based views, not mode-switching
- Persistent status bar (battery, connectivity) is universal
- Context-switching primary view (video/map/telemetry) works as tabs or customizable panels
- Widget architecture enables per-user customization

**Problems being solved:**

- "Dashboard" appears 3 times in current UI (header nav, mode switcher, bottom tab)
- Two video feed panels in Dashboard mode (confusing without connected robots)
- Modes within pages creates navigation identity crisis
- Missing operator-essential displays (battery, network health, diagnostics)

</notes>

---

_Phase: 08-ia-redesign_
_Context gathered: 2026-03-22_
