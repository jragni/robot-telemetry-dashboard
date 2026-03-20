# Phase 6: Panel System - Context

**Gathered:** 2026-03-20
**Status:** Ready for research + planning
**Updated:** 2026-03-20 (refined after C2/GCS research — 3-mode system)

<vision>
## How This Should Work

The dashboard has **3 distinct modes**, each with its own layout paradigm — inspired by QGroundControl's video/map swap pattern. Users switch between modes depending on their task. Each mode is a different "workspace" with its own optimal layout.

### Mode 1: DASHBOARD (Map Sovereign — Anduril Lattice inspired)

The overview/fleet mode. Map is dominant center showing robot positions. Video feeds as small PIP tiles. Fleet status cards. Connection status. This is what you see when managing multiple robots or planning.

```
┌──────────────────────────────────┐
│ [Bot1:●] [Bot2:●] [Bot3:○]       │
├───────┬──────────────────┬───────┤
│ Vid 1 │   MAP (SLAM)     │ Vid 2 │
│ (PIP) │   [robot dots]   │ (PIP) │
│       │   [paths]        │       │
├───────┤                  ├───────┤
│ Fleet │                  │ Alerts│
│ Status│                  │       │
└───────┴──────────────────┴───────┘
```

### Mode 2: PILOT (Video Sovereign — GCS cockpit inspired)

Active teleoperation mode. Video feed is dominant. LiDAR renders as a HUD minimap overlay (gaming style, bottom-left corner). Controls below video. Instrument gauges overlaid on video edges.

```
┌────────────────────────────────┐
│ VIDEO FEED                     │
│  ┌───────┐     heading: 045°   │
│  │ LiDAR │     vel: 0.5 m/s    │
│  │ (HUD) │     batt: 85%       │
│  └───────┘                     │
├────────────────────────────────┤
│ [←][↑][→][↓]  vel sliders [STOP]│
└────────────────────────────────┘
```

### Mode 3: ENGINEER (Foxglove-style panel grid)

Data analysis and debugging mode. Full Foxglove-style rearrangeable workspace. Every panel can be dragged, resized, tabbed. User builds their own layout from available widgets.

```
┌────────┬────────┬───────────┐
│ Video  │ LiDAR  │ [IMU|Plot] │
│        │        │  tab group │
├────────┤        ├───────────┤
│ Topics │        │ Raw Data   │
│        │        │            │
├────────┴────────┴───────────┤
│ Time Series Plot             │
└──────────────────────────────┘
  Everything resizable/rearrangeable
```

**Mode switching:** A mode selector in the header (3 buttons or tabs). Each mode saves its own layout independently. Switching modes is instant (no reload).

**Desktop experience:**

- Panels live in a grid. Drag borders between panels to resize.
- Drag a panel's header to move it to a new position.
- Explicit "Tab" button in panel menu to group panels into tabs (not drag-to-tab).
- [+] button to add new panels from a registry of available widgets.
- Layout saves to localStorage per view. Resets available.
- Controls (d-pad, velocity, e-stop) live UNDER the video feed by default.
- LiDAR renders as a HUD overlay on the video feed (gaming minimap style).
- Bottom row is user-customizable — add/remove telemetry plots, IMU, topics, etc.

**Default cockpit layout (what users see first):**

```
┌────────────────────────────────┐
│ VIDEO FEED                     │
│  ┌───────┐     heading: 045°   │
│  │ LiDAR │     vel: 0.5 m/s    │
│  │ (HUD) │     batt: 85%       │
│  └───────┘                     │
├────────────────────────────────┤
│ [←][↑][→][↓]  vel sliders [STOP]│
├────────┬─────────┬────────┬───┤
│ IMU    │ Plot 1  │ Topics │[+]│
└────────┴─────────┴────────┴───┘
```

**Mobile experience (different UX, same app):**

- Bottom tab bar for navigation (Dashboard, Fleet, Map, Pilot)
- Panels stack vertically or as swipeable cards (research-informed from QGroundControl + DJI Pilot patterns)
- No panel rearrangement on mobile — touch-optimized simplified view
- Virtual controls adapted for touch
- Inspired by QGroundControl tablet-first + DJI Pilot bottom-tab patterns

**Panel interactions:**

- Resize: drag column/row borders between panels
- Move: drag panel header to new position
- Tab: explicit tab button in panel menu (not drag-to-tab)
- Add: [+] button opens panel picker
- Remove: X button or panel menu
- Reset: context menu or button to restore default layout

</vision>

<essential>
## What Must Be Nailed

- **Great default layout out of the box** — most users never customize. The cockpit default should be so good that rearranging is optional.
- **Smooth, intuitive customization** — dragging, resizing, and tabbing panels should feel native like VS Code/Foxglove. The UX of customization matters as much as the features.
- **Layouts persist and restore** — localStorage per view. Custom layouts survive page refreshes. Reset button restores defaults.
- **Controls integrated in cockpit** — d-pad + velocity + e-stop live under the video as part of the default layout, not a separate page.
- **LiDAR as HUD** — overlaid on video feed like a gaming minimap, not a separate panel.
- **Desktop ≠ mobile** — two distinct experiences. Desktop gets full Foxglove rearrangement. Mobile gets simplified touch-optimized view.

</essential>

<boundaries>
## What's Out of Scope

- No panel-to-panel data linking — panels are independent (clicking a topic doesn't auto-open a plot)
- No collaborative/shared/synced layouts — all local, no cloud, no export/import
- No drag-to-create-tab — use explicit tab button instead (simpler to implement)
- No 3D view panels — 2D only for v3
- No custom panel creation by users — registry of predefined widget types only

</boundaries>

<specifics>
## Specific Ideas

- Inspired by Foxglove Studio's panel workspace (everything rearrangeable)
- Default layout is cockpit-style (video dominant, controls below, telemetry row at bottom)
- LiDAR HUD overlay like FPS game minimap (bottom-left corner of video)
- [+] button at end of bottom row to add telemetry panels
- Panels snap to grid tracks when resizing (not free-form pixel drag)
- Tab groups via explicit "Tab" menu button (VS Code-inspired but simpler)
- Mobile: QGroundControl tablet-first reflow + DJI Pilot bottom-tab pattern
- v2 bugs prevented: ISS-008 (use window.innerHeight for lg, static for sm), skipNextSaveRef for layout race condition

</specifics>

<notes>
## Additional Context

**Research findings (C2/GCS dashboards):**

- Palantir Blueprint.js: dark-gray scale from #1C2127 to #404854, cerulean blue accents
- Anduril Lattice: blue-black backgrounds (#0D1117), electric blue #00A8FF accents
- QGroundControl: tablet-first reflow, single codebase for all devices
- Foxglove Studio: desktop-only, no mobile solution — opportunity for v3 to differentiate
- DJI Pilot: bottom tabs + virtual sticks — proven touch UX for drone/robot control
- Gaming HUDs: minimap in corner, instruments overlaid, not in separate panels

**Key finding:** No robotics tool has solved mobile dashboards well. This is an opportunity.

**21st.dev components found:**

- HUD Button — military-style button component
- Animated HUD Targeting UI — overlay animations
- Blueprint Bento Grid — diagnostic-style grid panels
- Floating Panel — detachable panel component

**v2 lessons to carry forward:**

- ISS-008: Never derive rowHeight from container that grows with content
- onLayoutChange race: skipNextSaveRef guard after reset
- Context menu for desktop panel actions (right-click)
- Always-editable (no mode toggle)

</notes>

---

_Phase: 06-panel-system_
_Context gathered: 2026-03-20_
