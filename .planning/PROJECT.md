# Robot Telemetry Dashboard v3

## What This Is

A clean-slate rebuild of the Robot Telemetry Dashboard using lessons learned from v2. This is a web-based control and monitoring interface for ROS2-based autonomous robots, designed for defense and robotics applications.

**v3 is not incremental refinement of v2 — it is a complete rewrite** applying all architectural, code structure, and UX insights from the v2 rebuild. Key difference: v3 uses feature-by-feature specification-driven TDD with design-intelligent tooling (21st.dev Magic, Stitch, UI/UX Pro Max) to build components correctly the first time.

## Core Value

Deliver a professional-grade robot telemetry dashboard where:

1. **Architecture is non-negotiable** — RxJS + Zustand + roslib three-layer pattern prevents v1 context-sprawl failures
2. **Code structure scales** — one component per file, types co-located, no barrel files, domain-based organization (ADR-001, ADR-002)
3. **UI is production-quality** — design intelligence drives all visual decisions, responsive testing is automated
4. **Testing covers all paths** — TDD workflow with Vitest + Playwright ensures zero surprises in production
5. **Team can maintain it** — clear conventions, documented decisions, zero suppressed errors

## Requirements

### Validated from v2 (Carrying Forward)

- **Multi-robot control**: simultaneous independent piloting of 2-5 robots + swarm command mode for fleet-wide control
- **Dynamic data plotting**: auto-detect ROS2 message types, render time series / gauges / polar plots accordingly
- **SLAM integration**: OccupancyGrid map viewing with pan/zoom, on-demand fetch (not streaming)
- **Live video feed**: WebRTC or H.264 from each robot, synced with control latency <100ms
- **Topic discovery**: auto-detect available topics and message types from connected robot
- **Panel persistence**: drag-and-drop grid layout saved per view in localStorage
- **Responsive design**: desktop (lg>=1200px), tablet (md 768-1199px), mobile (sm<768px)
- **Connection management**: alert + auto-reconnect on rosbridge WebSocket loss
- **Theme**: Defense-contractor aesthetic (dark charcoal + electric blue, Anduril/Palantir inspired)

### Active for v3

- **Spec-driven feature development**: Every feature starts with SPEC.md describing what, edge cases, acceptance criteria
- **21st.dev Magic integration**: Component generation from curated library for production-quality shadcn/ui components
- **UI/UX Pro Max design intelligence**: Responsive breakpoints, accessibility patterns, design system best practices
- **TDD methodology**: Write tests first (Playwright E2E + Vitest unit), clarify edge cases in discuss-phase
- **Full code review discipline**: Zero lint warnings/errors, all inline types extracted, no barrel files, naming conventions enforced
- **Phase-by-phase foundation then features**: Complete scaffold (app shell, routing, design system) before building domain features

### Out of Scope for v3 Initial Build

- 3D visualization (Three.js/WebGL) — future post-v3 enhancement
- User authentication & role-based access control — not required for MVP
- AI/chatbot control — fully deferred, do not architect for it
- Internationalization (i18n) — English only
- Custom backend server — rosbridge + GitHub Pages SPA only
- Sensor fusion algorithms — pass-through only
- Autonomous waypoint navigation UI — future enhancement
- Keyboard shortcuts — mouse/touch interaction first
- Record/playback to disk — IndexedDB recording deferred to Phase 2

## Context: v2 Post-Mortem Learnings

### What Went Well in v2

- **RxJS + Zustand + roslib architecture** proven solid — three-layer separation of concerns prevents context-sprawl re-renders
- **Code convention enforcement** (ADR-001, ADR-002) eliminated 68% module bloat and scaling problems
- **TDD discipline** caught ISS-008 (infinite resize loop) before production
- **Responsive testing** with Playwright MCP automated viewport verification
- **Design system thinking** — context menu driven UI, always-editable panels, full-header drag

### What Went Wrong in v2

- **Overnight autonomous build** completed all phases in isolation without integration verification
  - DashboardView and MapView showed placeholder text despite all features being built
  - Phase 12 (Integration) never happened — each domain (telemetry, SLAM, panels) tested in vacuum
  - Lesson: integration phases must explicitly verify views render actual components, not stubbed imports
- **Dual-maintenance burden** — maintaining v2 code while researching v3 tools created context switching costs
  - Lesson: v3 is clean slate to avoid split focus

### Critical Bugs to Prevent in v3

- **ISS-008: Dynamic rowHeight infinite growth loop**
  - Root cause: Computing `rowHeight` from container height that grows with content creates feedback loop
  - Prevention: Use `window.innerHeight` for lg breakpoint (stable anchor), static 60px for md/sm
  - Lesson: Never derive a layout dimension from its own container when that container grows with content
- **react-grid-layout onLayoutChange race condition**
  - Root cause: `onLayoutChange` fires immediately after `resetLayout()`, re-saving old layout over fresh defaults
  - Prevention: `skipNextSaveRef` guard — set true before reset, checked in handler, cleared after
  - Lesson: State mutations + side effect ordering require explicit guards
- **roslib CommonJS compatibility**
  - Root cause: roslib ships as CommonJS, breaks on Vite upgrades without `optimizeDeps.include`
  - Prevention: Add roslib to `vite.config.ts` optimizeDeps every v3 upgrade
  - Lesson: Test roslib bundling after every Vite version bump
- **8-robot limit from Rules of Hooks**
  - Root cause: Fleet hooks used fixed 8-slot array for Rules compliance, silent failure on 9th robot
  - Prevention: Use dynamic subscription pattern or explicit runtime check
  - Lesson: Fixed arrays are technical debt waiting to happen

### Conventions That Worked (Carry Forward)

- **One component per .tsx file** — enforced via linter, eliminates multi-component files
- **All types in {ComponentName}.types.ts** — zero inline interfaces, types co-located with component
- **Show component for conditionals** — `<Show when={condition}><Content/></Show>` replaces ternaries
- **[].includes() for 3+ OR comparisons** — cleaner, more readable than chained ||
- **Stores in domain folders** (ADR-002) — not central `src/stores/`, co-locate with feature ownership
- **No barrel files** (ADR-001) — direct imports prevent circular dependencies and 68% module bloat
- **Import order: react/lib imports, then relative imports** — blank lines between groups
- **Named exports only** — no default exports, consistent import syntax
- **One-way data flow** — shared layer may be imported by features, never between features

### Workflow Improvements for v3

- **/discuss-phase before planning** — capture vision in CONTEXT.md, ask edge case questions before any code
- **TDD with upfront edge case discussion** — write tests first, clarify boundary conditions before implementing
- **Research agent for niche domains** — spawn research agents, use context7 MCP for current library docs
- **Quality gate is mandatory** — `npm run lint && tsc --noEmit && npm test -- --run && npm run build` must pass before phase advance
- **Lint warnings are failures** — zero tolerance, not suppressed with eslint-disable
- **GSD for everything, even hotfixes** — plan + execute + verify, no ad-hoc fixes
- **Integration phases must verify views** — don't assume features wired correctly, explicitly check components render

### Tools Available for v3 That v2 Didn't Have

- **21st.dev Magic MCP** — Searches curated library of pre-tested React components, no hallucination
  - Use case: Component generation with real implementations from a registry
- **Stitch (Google Labs) MCP** — Design-to-code pipeline, Figma/screenshots to React components
  - Use case: Converting design mockups to implementation quickly
- **UI/UX Pro Max Claude Skill** — Design intelligence databases with UX patterns and accessibility guidance
  - Use case: Making informed design decisions for responsive behavior, mobile patterns, accessibility

## Constraints

- **Framework**: React 19 + TypeScript 5.9 (team expertise, non-negotiable)
- **Robot Protocol**: ROS2 via roslib/rosbridge (standardized transport, proven in v2)
- **Build Tool**: Vite 7 (minimal, ESM native)
- **State Management**: Zustand + RxJS + roslib (three-layer proven pattern)
- **Component Library**: shadcn/ui + Radix primitives (production-quality, heavily themeable)
- **Design System**: UI/UX Pro Max intelligence driving all visual decisions
- **Testing**: Vitest for unit tests (TDD) + Playwright for E2E (responsive, interaction)
- **Deployment**: GitHub Pages (static SPA, no backend)
- **Branch**: `EPIC/v3-rebuild` (base: `EPIC/refactor-for-quality-of-life`)
- **Workflow**: GSD for all phases, TDD first, quality gate mandatory
- **Lint**: Zero warnings AND errors before any phase advance
- **Code Review**: All code must follow conventions (no suppression patterns)

## Key Decisions

| Decision                                     | Rationale                                                                                                                                             | Alternative Considered                                                      |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Clean slate v3, not v2 refinement**        | v2 suffered from overnight autonomous build integration gaps. Starting fresh with spec-driven feature approach prevents rebuild-while-learning tax.   | Incremental v2 fixes — rejected due to split focus burden                   |
| **Spec-driven TDD per feature**              | Each feature gets SPEC.md (what it does, edge cases, acceptance criteria), then tests, then code. Prevents ISS-008-style surprises.                   | Implement-then-test — rejected, found too late in v2                        |
| **21st.dev Magic + UI/UX Pro Max**           | Component generation from curated registry prevents hallucinations. Design intelligence prevents aesthetic inconsistencies. v2 had no design tooling. | Build all components from scratch — too slow                                |
| **RxJS + Zustand + roslib three-layer**      | Proven in v2. Avoids v1's context-sprawl problem. RxJS handles streams natively, Zustand handles UI state, roslib is thin transport.                  | Single Zustand store — rejected, RxJS is better for streams                 |
| **No barrel files (ADR-001)**                | TkDodo research: 68% module bloat. Circular import risk. Enforced at v3 linter level.                                                                 | Central index.ts re-exports — causes bundler bloat                          |
| **Stores in domain folders (ADR-002)**       | Co-location with features that own them prevents orphaned code. Feature ownership is clear.                                                           | Central `src/stores/` — rejected, ownership unclear                         |
| **One component per file**                   | Scales better than multi-component files. Easier to refactor, test, review.                                                                           | Multiple components per file — rejected, technical debt                     |
| **All types in .types.ts**                   | Eliminates inline interfaces, keeps component code clean, types easier to find.                                                                       | Inline types in .tsx — rejected, mixes concerns                             |
| **Always-editable panels with context menu** | v2 testing showed users want to drag/resize without mode toggle. Right-click for all actions is familiar and consistent.                              | Edit mode button + toolbar — rejected, usability test showed lower velocity |
| **On-demand OccupancyGrid fetch**            | rosbridge JSON serialization inflates binary 3-4x. 40KB-600KB per update depending on resolution. Continuous subscription wastes bandwidth.           | Live streaming maps — rejected, bandwidth overhead                          |
| **GitHub Pages deployment**                  | Static SPA, no backend server required, free, proven with v2.                                                                                         | Custom Node backend — over-engineered for MVP                               |

## File Structure (v3 Scaffold)

```
src/
  shared/
    components/          # shadcn/ui + custom components used by 2+ features
    hooks/               # Custom hooks (useConnection, useRobotState, etc.)
    stores/              # Shared Zustand stores (connection, ui state)
    types/               # Shared TypeScript types and interfaces
    utils/               # Utility functions (format, convert, etc.)
  features/
    dashboard/           # Dashboard view, panels, grid
    fleet/               # Multi-robot overview, selection
    pilot/               # Single robot control interface
    map/                 # SLAM OccupancyGrid visualization
    telemetry/           # Topic discovery, data plotting
    connection/          # ROS connection management
  services/
    ros/                 # ROS2/roslib communication layer
      transport/         # WebSocket, topic subscriptions
      types/             # ROS message types
  pages/                 # Route pages (App.tsx, routes)
  config/                # App-wide constants, theme config
```

## Success Criteria

- All 5 core features (multi-robot, dynamic plotting, SLAM map, live video, topic discovery) shipping with zero lint warnings/errors
- 95%+ test coverage on critical paths (connection, topic subscription, control input, panel layout)
- Responsive testing automated (Playwright E2E for desktop/tablet/mobile)
- Zero code suppression patterns (@ts-ignore, eslint-disable, // @ts-nocheck)
- All decisions documented as ADRs in `.planning/knowledge/decisions/`
- Deployment to GitHub Pages automatic on main branch
- Team can extend features without breaking conventions
