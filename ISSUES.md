# Issues — General Housekeeping

Consolidated from parallel architecture and code quality audits.

---

## Raw Findings

### CRITICAL

#### F-01: Zero Error Boundaries
- **Files:** `src/App.tsx`, `src/components/AppShell.tsx`
- **Problem:** No `ErrorBoundary` components anywhere. A runtime exception in any component (especially canvas draws on malformed ROS data) crashes the entire React tree with a blank screen.
- **Fix:** Root-level error boundary in App + per-panel error boundaries in workspace.

#### F-02: Near-Zero Test Coverage
- **Files:** Entire `src/` — only `src/__tests__/roslib-smoke.test.ts` exists (4 tests, zero behavioral assertions)
- **Problem:** 11K+ lines of code with 1 smoke test. All hooks, utils, store actions, and pure functions are untested.
- **Testable units:** `quaternionToEuler`, `normalizeHeading`, `calculateBackoffDelay`, `buildTwist`, `formatUptime`, `formatLastSeen`, `normalizeRosbridgeUrl`, `assignRobotColor`, `deriveRosbridgeUrl`, `deriveWebRtcUrl`, `rafThrottle`, `useControlPublisher`, `useImuSubscription`, `useLidarSubscription`, `useConnectionStore` actions, `ConnectionManager`

### HIGH

#### F-03: Unsafe Type Assertions on ROS Messages
- **Files:** `src/features/workspace/hooks/useImuSubscription.ts:55`, `src/features/workspace/hooks/useLidarSubscription.ts:32`, `src/features/workspace/hooks/useTelemetrySubscription.ts:38-71`, `src/hooks/useBatterySubscription.ts:31`
- **Problem:** All `onMessage` callbacks use `msg as SomeType` with zero runtime validation. Malformed rosbridge messages will crash: `m.orientation` undefined → NaN propagates; `m.ranges` undefined → TypeError.
- **Fix:** Zod `safeParse` on inbound messages. Zod already in deps.

#### F-04: Canvas Color Resolution Duplicated 5x
- **Files:** `src/features/workspace/components/LidarPanel.tsx:33-85`, `src/features/workspace/components/TelemetryPanel.tsx:29-69`, `src/features/workspace/components/ImuPanel/components/AttitudeIndicator.tsx:18-53`, `src/features/workspace/components/ImuPanel/components/CompassHeading.tsx:15-41`, `src/features/workspace/components/ImuPanel/components/WireframeView.tsx:18-46`
- **Shared hook exists:** `src/hooks/useCanvasColors.ts` — used correctly by pilot feature but NOT by workspace
- **Problem:** Each workspace canvas component manually reimplements `colorsRef`, `colorsResolved`, `resolveColors()` with `getComputedStyle(canvas)`. The hook uses `document.documentElement` instead — needs an optional element ref param.
- **Fix:** Extend `useCanvasColors` to accept optional element ref, migrate all 5 workspace components.

#### F-05: Dead Props — `angularVelocity` / `linearAcceleration`
- **Files:** `src/features/workspace/RobotWorkspace.tsx:243-244`, `src/features/workspace/components/ImuPanel/ImuPanel.tsx:16`, `src/features/workspace/types/ImuPanel.types.ts:37-38`
- **Problem:** Subscribed via `useImuSubscription`, passed as props, but `ImuPanel` only destructures `{ roll, pitch, yaw, connected }`. Data is fetched, serialized, threaded, and silently discarded.
- **Fix:** Either remove from props chain or wire to an IMU numbers view.

#### F-06: Robot ID Generation — Collision + URL Safety
- **Files:** `src/stores/connection/useConnectionStore.ts:18`, `src/features/fleet/components/AddRobotModal/AddRobotModal.tsx:73`
- **Problem:** `name.toLowerCase().replace(/\s+/g, '-')` — "Atlas 01" and "Atlas  01" collide, special chars produce URL-unsafe IDs like `atlas/01`. Duplicate guard lives only in UI (AddRobotModal), not in store — programmatic `addRobot` silently overwrites.
- **Fix:** URL-safe slug sanitizer, move duplicate check into store, Zod refinement on resulting ID.

#### F-07: All onMessage Handlers Crash on Partial Messages
- **Files:** Same as F-03 plus `src/lib/webrtc/signaling.ts:39`
- **Problem:** No try/catch around message processing. `quaternionToEuler` on undefined orientation → NaN cascade. `m.ranges.length` on undefined → TypeError. Crashes propagate out of roslib callbacks unhandled.
- **Fix:** Guard critical fields before access, wrap handlers in try/catch.

### MEDIUM

#### F-08: ConditionalRender — AI Pattern, Performance Risk
- **Files:** `src/components/ConditionalRender.tsx`, 15 consumer files (35 call sites total)
- **Key consumers:** `src/features/workspace/RobotWorkspace.tsx:163-303` (all 6 panels), `src/components/Sidebar/Sidebar.tsx` (5 uses), `src/features/fleet/FleetOverview.tsx`, `src/features/fleet/components/RobotCard/RobotCard.tsx`, `src/features/fleet/components/AddRobotModal/AddRobotModal.tsx`
- **Problem:** Takes `Component: ReactNode` (pre-evaluated), not a render function. JSX subtree always constructed even when `shouldRender=false`. Idiomatic React uses `&&` or ternaries. Signals AI-generated pattern to reviewers.
- **Fix:** Replace all usages with `&&` or ternaries, delete component, remove convention rule.

#### F-09: No Route-Level Code Splitting
- **Files:** `src/App.tsx:2-9`
- **Problem:** All routes eagerly imported — `LandingPage` (GSAP), `MockupsPage` (dev-only), `RobotWorkspace` (heavy canvas). Initial bundle includes everything.
- **Fix:** `React.lazy()` + `Suspense` on each route.

#### F-10: `useRosTopics` Emits New Array Every Poll Cycle
- **Files:** `src/hooks/useRosTopics.ts:38`, `src/features/workspace/RobotWorkspace.tsx:69-75`
- **Problem:** `setTopics(discovered)` creates new array ref every 10s even when topics haven't changed. Triggers `filteredTopics` useMemo recomputation and downstream re-renders.
- **Fix:** Compare old and new arrays before calling `setTopics` (same pattern as `useRosGraph:29-34`).

#### F-11: `../../` Import Violations in Pilot Feature
- **Files:** `src/features/pilot/components/PilotGyroReadout/PilotGyroReadout.tsx:1-2`, `src/features/pilot/components/PilotStatusBar/PilotStatusBar.tsx:1-2`, `src/features/pilot/components/PilotControls/PilotControls.tsx:7-8`, `src/features/pilot/components/PilotControls/EStopButton.tsx:3`, `src/features/pilot/components/PilotStatusBar/ConnectionRow.tsx:1`, `src/features/pilot/components/PilotGyroReadout/GyroRow.tsx:2`
- **Problem:** CLAUDE.md: "Never use `../../` or deeper — use `@/` instead." These climb from `components/{Sub}/` to feature root.
- **Fix:** Replace with `@/features/pilot/constants` and `@/features/pilot/types/...`.

#### F-12: Cross-Feature Hooks Misplaced
- **Files:** `src/features/workspace/hooks/useImuSubscription.ts`, `src/features/workspace/hooks/useLidarSubscription.ts`
- **Problem:** Used by both workspace and pilot features, but scoped under `workspace/hooks/`. They encode general ROS subscription patterns, not workspace-specific logic.
- **Fix:** Move to `src/hooks/` alongside `useBatterySubscription`, `useRosSubscriber`, `useRosTopics`.

#### F-13: Duplicate Constants Across Features
- **Files:** `src/features/workspace/constants.ts:13-18` + `src/features/pilot/constants.ts:72-77` (COMPASS_CARDINALS), `src/features/workspace/constants.ts:45` + `src/features/pilot/constants.ts:207` (LIDAR_POINT_RADIUS)
- **Problem:** Identical values defined in two feature constant files. Risk of drift.
- **Fix:** Move shared constants to `src/constants/` or `src/utils/`.

#### F-14: Constants File Naming Convention Violations
- **Files:** `src/constants/controls.constants.ts`, `src/constants/reconnection.constants.ts`
- **Problem:** CLAUDE.md mandates `constants.ts`, not `{feature}.constants.ts`.
- **Fix:** Rename to `controls.ts` and `reconnection.ts`.

#### F-15: `selectedTopics` Typed as `Record<string, string>`
- **Files:** `src/stores/connection/useConnectionStore.types.ts:15`
- **Problem:** Panel IDs are known at compile time (`WORKSPACE_PANEL_IDS`). Using `Record<string, string>` loses type safety — any string key accepted without error.
- **Fix:** `Partial<Record<PanelId, string>>` where `PanelId` is union from panel IDs.

#### F-16: Types File Misplacement — SystemStatusPanel
- **Files:** `src/features/workspace/types/SystemStatusPanel.types.ts`
- **Problem:** Contains `StatusRowProps` and `ExpandableRowProps` — types for separate components. Convention: "named after the primary consumer."
- **Fix:** Extract to `StatusRow.types.ts` and `ExpandableRow.types.ts`.

#### F-17: Store Migration Uses Unsafe Type Assertions
- **Files:** `src/stores/connection/useConnectionStore.ts:103-127`
- **Problem:** Three-layer `as Record<string, unknown>` chain. Zod is in deps but not used here.
- **Fix:** Zod schema for persisted state migration.

#### F-18: shadcn UI Deep Relative Imports
- **Files:** All `src/components/ui/*.tsx` (button, input, dialog, select, badge, card, popover)
- **Problem:** Generated code uses `../../lib/utils` instead of `@/lib/utils`. Currently ESLint-ignored.
- **Fix:** Find-and-replace after each `shadcn add` run.

#### F-19: `ActivePanelContent` Violates One-Component-Per-File
- **Files:** `src/features/workspace/components/RobotWorkspaceMobile.tsx:157`
- **Problem:** 50-line component with 15 props and JSDoc, defined inside another component file.
- **Fix:** Extract to `ActivePanelContent.tsx`.

#### F-20: Duplicate Zoom Control Pattern
- **Files:** `src/features/workspace/components/LidarPanel.tsx:223-238`, `src/features/pilot/components/PilotLidarMinimap.tsx:166-183`
- **Problem:** Identical zoom state machine (useState, handleWheel, zoomIn/zoomOut with same clamp) + duplicated +/- button UI.
- **Fix:** Extract `useZoom` hook or `ZoomControls` shared component.

### LOW

#### F-21: JSDoc Uniformity on Private/Trivial Symbols
- **Files:** `src/lib/rosbridge/ConnectionManager.ts:11-62` (private Maps, Sets, constants), `src/hooks/useControlPublisher/constants.ts`, various
- **Problem:** Every symbol — including private module vars and `LIDAR_POINT_RADIUS = 2` — has identical JSDoc ceremony. Signals AI generation, flattens signal about what's actually complex.
- **Fix:** Remove JSDoc from private module-scope symbols and trivial constants. Keep on exported APIs.

#### F-22: Orphaned/Misaligned JSDoc Block
- **Files:** `src/stores/connection/useConnectionStore.helpers.ts:22-28`
- **Problem:** `assignRobotColor` JSDoc appears before `deriveWebRtcUrl` function — misaligned.
- **Fix:** Realign or remove.

#### F-23: `setTopic` Missing `useCallback`
- **Files:** `src/features/workspace/RobotWorkspace.tsx:57-59`
- **Problem:** Inline function creates new reference every render, passed to 6 panels. Latent issue if panels are memoized.
- **Fix:** Wrap in `useCallback`.

#### F-24: `eslint-disable` on Canvas `themeVersion` Deps (5 files)
- **Files:** `LidarPanel.tsx`, `TelemetryPanel.tsx`, `CompassHeading.tsx`, `WireframeView.tsx`, `AttitudeIndicator.tsx`
- **Problem:** All suppress `react-hooks/exhaustive-deps` for the same reason. Migrating to `useCanvasColors` would eliminate these.
- **Fix:** Resolved by F-04 migration.

#### F-25: `eslint-disable` on `scheduleReconnect` Circular Dep
- **Files:** `src/hooks/useWebRtcStream/useWebRtcStream.ts:71`
- **Problem:** `scheduleReconnect` and `connect` mutually reference each other through closures. Suppression could hide stale closure bug.
- **Fix:** Refactor so they don't circularly depend.

#### F-26: Empty `video.play().catch(() => {})`
- **Files:** `src/hooks/useWebRtcStream/useWebRtcStream.ts:169`
- **Problem:** Silences all play errors, not just autoplay blocks.
- **Fix:** Log non-autoplay errors.

#### F-27: Demo Route Is Unfinished Alias
- **Files:** `src/App.tsx:26`
- **Problem:** `/demo` renders `<FleetOverview />` with no differentiation.
- **Fix:** Remove or implement demo mode.

#### F-28: 3-Level Mobile Prop Relay
- **Files:** `src/features/workspace/RobotWorkspace.tsx`, `src/features/workspace/components/RobotWorkspaceMobile.tsx`
- **Problem:** Workspace → RobotWorkspaceMobile (16 props) → ActivePanelContent (15 props) → panel. All panel data resolved even when only one tab active.
- **Fix:** Context or panel-owned subscriptions for mobile path.

---

## Tickets

### TICKET-001: Move Cross-Feature Hooks to src/hooks/
- **Type:** blocking
- **Severity:** medium
- **Findings:** F-12
- **Files affected:**
  - `src/features/workspace/hooks/useImuSubscription.ts` (move to `src/hooks/useImuSubscription.ts`)
  - `src/features/workspace/hooks/useLidarSubscription.ts` (move to `src/hooks/useLidarSubscription.ts`)
  - `src/features/workspace/RobotWorkspace.tsx` (update import paths)
  - `src/features/pilot/PilotView.tsx` (update import paths)
- **Conflicts with:** TICKET-003, TICKET-004, TICKET-009 (all depend on hooks at final paths)
- **Branch:** `fix/ticket-001/move-cross-feature-hooks`
- **Scope:** Move `useImuSubscription` and `useLidarSubscription` from `workspace/hooks/` to `src/hooks/`. Update all consumer imports.
- **Acceptance criteria:**
  - [ ] Hooks exist at `src/hooks/`; originals deleted
  - [ ] All consumers import from `@/hooks/`
  - [ ] `npm run build` passes; ESLint passes

### TICKET-002: Rename Constants Files to Drop Feature Suffix
- **Type:** blocking
- **Severity:** low
- **Findings:** F-14
- **Files affected:**
  - `src/constants/controls.constants.ts` (rename to `src/constants/controls.ts`)
  - `src/constants/reconnection.constants.ts` (rename to `src/constants/reconnection.ts`)
  - All files importing from these paths
- **Conflicts with:** TICKET-010 (builds on renamed structure)
- **Branch:** `fix/ticket-002/rename-constants-files`
- **Scope:** Rename both files per convention. Update all import paths.
- **Acceptance criteria:**
  - [ ] Old filenames deleted; new filenames exist
  - [ ] All import paths updated
  - [ ] `npm run build` passes

### TICKET-003: Zod Validation and try/catch on All ROS Message Handlers
- **Type:** non-blocking
- **Severity:** high
- **Findings:** F-03, F-07
- **Files affected:**
  - `src/hooks/useImuSubscription.ts` (Zod schema + try/catch)
  - `src/hooks/useLidarSubscription.ts` (Zod schema + try/catch)
  - `src/features/workspace/hooks/useTelemetrySubscription.ts` (Zod schema + try/catch)
  - `src/hooks/useBatterySubscription.ts` (Zod schema + try/catch)
  - `src/lib/webrtc/signaling.ts` (try/catch on message handler)
- **Conflicts with:** none (after TICKET-001 merges)
- **Branch:** `fix/ticket-003/zod-ros-message-validation`
- **Scope:** Replace all `msg as SomeType` with Zod `safeParse`. Wrap every `onMessage` in try/catch. Log failures at `console.warn`.
- **Acceptance criteria:**
  - [ ] Each subscription hook has a Zod schema
  - [ ] `onMessage` uses `safeParse` and returns early on failure
  - [ ] No `msg as SomeType` casts remain in subscription hooks
  - [ ] Unit tests: each Zod schema tested with valid message, partial message, and empty object
  - [ ] Unit tests: `onMessage` handler returns gracefully (no throw) on malformed input
  - [ ] `npm run build` passes; no `as any` introduced; all tests pass

### TICKET-004: Migrate Workspace Canvas Components to useCanvasColors
- **Type:** non-blocking
- **Severity:** high
- **Findings:** F-04, F-24
- **Files affected:**
  - `src/hooks/useCanvasColors.ts` (extend with optional `elementRef` param)
  - `src/features/workspace/components/LidarPanel.tsx` (adopt hook)
  - `src/features/workspace/components/TelemetryPanel.tsx` (adopt hook)
  - `src/features/workspace/components/ImuPanel/components/AttitudeIndicator.tsx` (adopt hook)
  - `src/features/workspace/components/ImuPanel/components/CompassHeading.tsx` (adopt hook)
  - `src/features/workspace/components/ImuPanel/components/WireframeView.tsx` (adopt hook)
- **Conflicts with:** TICKET-014 (both modify `LidarPanel.tsx` — this ticket first)
- **Branch:** `fix/ticket-004/migrate-canvas-colors-hook`
- **Scope:** Extend `useCanvasColors` with optional element ref. Remove duplicated color resolution from all 5 workspace canvas components. Eliminates 5 `eslint-disable` suppressions.
- **Acceptance criteria:**
  - [ ] `useCanvasColors` accepts optional `elementRef`
  - [ ] All 5 components use shared hook; no inline color resolution
  - [ ] All 5 `eslint-disable` suppressions for `themeVersion` removed
  - [ ] Canvas theme redraw works after theme toggle
  - [ ] Unit tests: `useCanvasColors` returns color object with and without element ref
  - [ ] `npm run build` and ESLint pass; all tests pass

### TICKET-005: Add Error Boundaries — Root and Per-Panel
- **Type:** non-blocking
- **Severity:** critical
- **Findings:** F-01
- **Files affected:**
  - `src/components/ErrorBoundary.tsx` (create)
  - `src/components/PanelErrorBoundary.tsx` (create)
  - `src/App.tsx` (wrap route tree)
  - `src/components/AppShell.tsx` (wrap outlet)
  - `src/features/workspace/components/WorkspacePanel.tsx` (wrap panel children)
- **Conflicts with:** TICKET-017 (both modify `App.tsx` — this ticket first)
- **Branch:** `fix/ticket-005/error-boundaries`
- **Scope:** Root `ErrorBoundary` prevents blank-screen crashes. `PanelErrorBoundary` isolates canvas throws per panel.
- **Acceptance criteria:**
  - [ ] Both boundary components exist with design-system-matching fallback UI
  - [ ] Root boundary wraps route tree
  - [ ] Each `WorkspacePanel` wraps children in `PanelErrorBoundary`
  - [ ] Canvas throw collapses only the affected panel
  - [ ] Unit tests: `ErrorBoundary` renders fallback when child throws
  - [ ] Unit tests: `PanelErrorBoundary` renders panel-level error state when child throws
  - [ ] Unit tests: non-throwing children render normally through both boundaries
  - [ ] E2E: workspace page loads with all panels; simulated panel error shows fallback without crashing other panels
  - [ ] `npm run build` passes; all tests pass

### TICKET-006: Robot ID Safety — Slug Sanitizer, Store Duplicate Guard, Zod Migration
- **Type:** non-blocking
- **Severity:** high
- **Findings:** F-06, F-17
- **Files affected:**
  - `src/stores/connection/useConnectionStore.helpers.ts` (add `toRobotId`)
  - `src/stores/connection/useConnectionStore.ts` (use `toRobotId`, add duplicate guard, Zod migration)
  - `src/features/fleet/components/AddRobotModal/AddRobotModal.tsx` (remove local duplicate check)
- **Conflicts with:** TICKET-015 (both touch store types — don't run in parallel)
- **Branch:** `fix/ticket-006/robot-id-safety`
- **Scope:** URL-safe slug sanitizer. Move duplicate guard into store. Replace `merge` assertion chain with Zod.
- **Acceptance criteria:**
  - [ ] `toRobotId('Atlas  01')` === `toRobotId('Atlas 01')`
  - [ ] `toRobotId('atlas/01!')` produces URL-safe result
  - [ ] `addRobot` rejects duplicate IDs
  - [ ] Persisted-state `merge` uses Zod; no `as Record<>` chains
  - [ ] Unit tests: `toRobotId` — whitespace collapse, special chars, hyphens, empty string, unicode
  - [ ] Unit tests: `addRobot` duplicate guard — rejects same name, rejects whitespace variant of existing name
  - [ ] Unit tests: Zod migration schema — valid persisted state, corrupted state, missing fields
  - [ ] `npm run build` passes; all tests pass

### TICKET-007: Purge ConditionalRender — Replace All 35 Usages
- **Type:** non-blocking
- **Severity:** medium
- **Findings:** F-08
- **Files affected:**
  - `src/components/ConditionalRender.tsx` (delete)
  - `src/features/workspace/RobotWorkspace.tsx` (7 usages)
  - `src/components/Sidebar/Sidebar.tsx` (5 usages)
  - `src/components/Sidebar/NavItem.tsx` (2 usages)
  - `src/features/fleet/FleetOverview.tsx`
  - `src/features/fleet/components/RobotCard/RobotCard.tsx`
  - `src/features/fleet/components/AddRobotModal/AddRobotModal.tsx`
  - `src/features/fleet/components/AddRobotModal/components/FieldError.tsx`
  - `src/features/workspace/components/WorkspacePanel.tsx`
  - `src/features/workspace/components/TopicSelector.tsx`
  - `src/features/workspace/components/CameraPanel.tsx`
  - `src/features/workspace/components/SystemStatusPanel.tsx`
  - `src/features/workspace/components/ExpandableRow.tsx`
  - `src/features/pilot/components/PilotCamera.tsx`
  - `src/components/AppShell.tsx`
  - `src/components/Header.tsx`
- **Conflicts with:** TICKET-012, TICKET-013, TICKET-021 (all modify `RobotWorkspace.tsx` — this ticket first)
- **Branch:** `fix/ticket-007/remove-conditional-render`
- **Scope:** Replace all 35 call sites with `&&` or ternaries. Delete component.
- **Acceptance criteria:**
  - [ ] `ConditionalRender.tsx` deleted
  - [ ] `grep -r ConditionalRender src/` returns empty
  - [ ] E2E: fleet page, workspace page, and pilot page all render correctly after removal
  - [ ] `npm run build` passes; ESLint passes

### TICKET-008: Test Coverage — Utils and Pure Functions
- **Type:** non-blocking
- **Severity:** critical
- **Findings:** F-02 (utils slice)
- **Files affected:**
  - `src/utils/__tests__/quaternionToEuler.test.ts` (create)
  - `src/utils/__tests__/normalizeHeading.test.ts` (create)
  - `src/utils/__tests__/rafThrottle.test.ts` (create)
  - `src/utils/__tests__/formatUptime.test.ts` (create)
  - `src/utils/__tests__/formatLastSeen.test.ts` (create)
  - `src/stores/connection/__tests__/useConnectionStore.helpers.test.ts` (create)
  - `src/lib/rosbridge/__tests__/ConnectionManager.test.ts` (create)
- **Conflicts with:** none
- **Branch:** `test/ticket-008/utils-pure-function-coverage`
- **Scope:** Vitest unit tests for all pure functions. Note: `quaternionToEuler` must be extracted/exported first.
- **Acceptance criteria:**
  - [ ] `quaternionToEuler`: identity, 90° roll, 90° pitch, gimbal lock
  - [ ] `normalizeHeading`: 0°, 360° wrap, negatives, >360°
  - [ ] `rafThrottle`: single call, rapid dedup, cancel
  - [ ] `formatUptime`/`formatLastSeen`: boundary values
  - [ ] `normalizeRosbridgeUrl`, `deriveRosbridgeUrl`, `deriveWebRtcUrl`: bare IP, ws://, wss://, invalid
  - [ ] `assignRobotColor`: cycling through colors
  - [ ] `ConnectionManager`: connect, disconnect, reconnect guard
  - [ ] All tests pass via `npm run test`

### TICKET-009: Test Coverage — Hooks and Store Actions
- **Type:** non-blocking
- **Severity:** critical
- **Findings:** F-02 (hooks/store slice)
- **Files affected:**
  - `src/hooks/__tests__/useImuSubscription.test.ts` (create)
  - `src/hooks/__tests__/useLidarSubscription.test.ts` (create)
  - `src/hooks/useControlPublisher/__tests__/useControlPublisher.test.ts` (create)
  - `src/stores/connection/__tests__/useConnectionStore.test.ts` (create)
- **Conflicts with:** none (new test files only)
- **Branch:** `test/ticket-009/hook-store-coverage`
- **Scope:** Vitest + RTL tests for subscription hooks and store actions.
- **Acceptance criteria:**
  - [ ] `useImuSubscription`: valid message → correct Euler angles
  - [ ] `useLidarSubscription`: valid scan → correct points; NaN filtered
  - [ ] `useControlPublisher` `buildTwist`: correct direction mapping
  - [ ] `useConnectionStore`: addRobot, removeRobot, setRobotTopic
  - [ ] All tests pass via `npm run test`

### TICKET-010: Deduplicate Shared Constants into src/constants/
- **Type:** non-blocking
- **Severity:** medium
- **Findings:** F-13
- **Files affected:**
  - `src/constants/canvas.ts` (create)
  - `src/features/workspace/constants.ts` (remove duplicates)
  - `src/features/pilot/constants.ts` (remove duplicates)
  - Canvas components importing these constants (update sources)
- **Conflicts with:** none (after TICKET-002 merges)
- **Branch:** `fix/ticket-010/deduplicate-shared-constants`
- **Scope:** Extract `COMPASS_CARDINALS` and `LIDAR_POINT_RADIUS` to `src/constants/canvas.ts`. Remove duplicates.
- **Acceptance criteria:**
  - [ ] `src/constants/canvas.ts` exports both constants
  - [ ] Neither defined in workspace or pilot constants
  - [ ] All consumers import from `@/constants/canvas`
  - [ ] `npm run build` passes

### TICKET-011: Fix Pilot Feature Deep Relative Imports
- **Type:** non-blocking
- **Severity:** medium
- **Findings:** F-11
- **Files affected:**
  - `src/features/pilot/components/PilotGyroReadout/PilotGyroReadout.tsx`
  - `src/features/pilot/components/PilotStatusBar/PilotStatusBar.tsx`
  - `src/features/pilot/components/PilotControls/PilotControls.tsx`
  - `src/features/pilot/components/PilotControls/EStopButton.tsx`
  - `src/features/pilot/components/PilotStatusBar/ConnectionRow.tsx`
  - `src/features/pilot/components/PilotGyroReadout/GyroRow.tsx`
- **Conflicts with:** none
- **Branch:** `fix/ticket-011/pilot-import-aliases`
- **Scope:** Replace all `../../` imports with `@/` aliases. Import paths only — no logic changes.
- **Acceptance criteria:**
  - [ ] Zero `../../` imports in `src/features/pilot/components/`
  - [ ] `npm run build` passes; ESLint passes

### TICKET-012: setTopic useCallback and useRosTopics Array Stability
- **Type:** non-blocking
- **Severity:** low
- **Findings:** F-23, F-10
- **Files affected:**
  - `src/features/workspace/RobotWorkspace.tsx` (wrap `setTopic` in `useCallback`)
  - `src/hooks/useRosTopics.ts` (array-equality check before `setTopics`)
- **Conflicts with:** TICKET-007, TICKET-013, TICKET-021 (shared `RobotWorkspace.tsx` — run after TICKET-007)
- **Branch:** `fix/ticket-012/rostopics-stability`
- **Scope:** Stable `setTopic` ref. Fix `useRosTopics` to not re-emit unchanged arrays.
- **Acceptance criteria:**
  - [ ] `setTopic` wrapped in `useCallback`
  - [ ] `useRosTopics` only calls `setTopics` when topics changed
  - [ ] Unit tests: `useRosTopics` does not emit new ref when topics unchanged (mock ROS service)
  - [ ] `npm run build` passes; all tests pass

### TICKET-013: Remove Dead IMU Props
- **Type:** non-blocking
- **Severity:** high
- **Findings:** F-05
- **Files affected:**
  - `src/features/workspace/RobotWorkspace.tsx` (remove prop pass-through)
  - `src/features/workspace/components/ImuPanel/ImuPanel.tsx` (remove from destructure)
  - `src/features/workspace/types/ImuPanel.types.ts` (remove from props)
- **Conflicts with:** TICKET-007, TICKET-012, TICKET-021 (shared `RobotWorkspace.tsx` — run after TICKET-007)
- **Branch:** `fix/ticket-013/remove-dead-imu-props`
- **Scope:** Remove `angularVelocity` and `linearAcceleration` from the props chain. Keep in hook return type for future use.
- **Acceptance criteria:**
  - [ ] `ImuPanelProps` no longer declares dead fields
  - [ ] `RobotWorkspace` doesn't pass them
  - [ ] `npm run build` passes; no unused variable errors

### TICKET-014: Extract useZoom Hook
- **Type:** non-blocking
- **Severity:** medium
- **Findings:** F-20
- **Files affected:**
  - `src/hooks/useZoom.ts` (create)
  - `src/features/workspace/components/LidarPanel.tsx` (adopt hook)
  - `src/features/pilot/components/PilotLidarMinimap.tsx` (adopt hook)
- **Conflicts with:** TICKET-004 (both modify `LidarPanel.tsx` — TICKET-004 first)
- **Branch:** `fix/ticket-014/extract-use-zoom`
- **Scope:** Extract duplicated zoom state machine into shared hook.
- **Acceptance criteria:**
  - [ ] `useZoom` exists at `src/hooks/useZoom.ts`
  - [ ] Both components use hook; no duplicated zoom logic
  - [ ] Zoom behavior (wheel, buttons, clamping) unchanged
  - [ ] Unit tests: `useZoom` — zoomIn/zoomOut clamp at min/max, step size correct, handleWheel direction
  - [ ] `npm run build` passes; all tests pass

### TICKET-015: Type Tightening — PanelId Union and Types Split
- **Type:** non-blocking
- **Severity:** medium
- **Findings:** F-15, F-16
- **Files affected:**
  - `src/features/workspace/types/panel.types.ts` (create — `PanelId` union)
  - `src/stores/connection/useConnectionStore.types.ts` (tighten `selectedTopics`)
  - `src/features/workspace/types/StatusRow.types.ts` (create)
  - `src/features/workspace/types/ExpandableRow.types.ts` (create)
  - `src/features/workspace/types/SystemStatusPanel.types.ts` (remove split types)
  - `src/features/workspace/components/SystemStatusPanel.tsx` (update imports)
- **Conflicts with:** TICKET-006 (both touch store types — don't run in parallel)
- **Branch:** `fix/ticket-015/type-tightening`
- **Scope:** Derive `PanelId` from `WORKSPACE_PANEL_IDS`. Tighten `selectedTopics`. Split types per consumer.
- **Acceptance criteria:**
  - [ ] `PanelId` derived from `WORKSPACE_PANEL_IDS`
  - [ ] Invalid panel ID string is a TypeScript error
  - [ ] Each types file named after its primary consumer
  - [ ] `npm run build` passes

### TICKET-016: Extract ActivePanelContent from RobotWorkspaceMobile
- **Type:** non-blocking
- **Severity:** medium
- **Findings:** F-19
- **Files affected:**
  - `src/features/workspace/components/ActivePanelContent.tsx` (create)
  - `src/features/workspace/types/ActivePanelContent.types.ts` (create)
  - `src/features/workspace/components/RobotWorkspaceMobile.tsx` (remove inline, import)
- **Conflicts with:** TICKET-021 (creates the file TICKET-021 modifies — this first)
- **Branch:** `fix/ticket-016/extract-active-panel-content`
- **Scope:** Extract `ActivePanelContent` into its own file per one-component-per-file rule.
- **Acceptance criteria:**
  - [ ] `ActivePanelContent.tsx` exists as named export
  - [ ] `ActivePanelContent.types.ts` exists
  - [ ] No inline component in `RobotWorkspaceMobile.tsx`
  - [ ] `npm run build` passes

### TICKET-017: Route-Level Code Splitting and Remove Demo Route
- **Type:** non-blocking
- **Severity:** medium
- **Findings:** F-09, F-27
- **Files affected:**
  - `src/App.tsx` (React.lazy, Suspense, remove `/demo`)
- **Conflicts with:** TICKET-005 (both modify `App.tsx` — TICKET-005 first)
- **Branch:** `fix/ticket-017/code-splitting`
- **Scope:** Lazy-load all routes. Remove unimplemented `/demo` alias.
- **Acceptance criteria:**
  - [ ] All route imports use `React.lazy()`
  - [ ] `Suspense` wrapper with loading state
  - [ ] `/demo` route removed
  - [ ] Build output shows route chunks split
  - [ ] E2E: navigate to each route — landing, fleet, workspace, pilot — all load correctly with lazy loading
  - [ ] All routes navigate correctly

### TICKET-018: Fix shadcn UI Component Relative Imports
- **Type:** non-blocking
- **Severity:** medium
- **Findings:** F-18
- **Files affected:**
  - All `src/components/ui/*.tsx` (replace `../../lib/utils` with `@/lib/utils`)
- **Conflicts with:** none
- **Branch:** `fix/ticket-018/shadcn-import-aliases`
- **Scope:** Replace relative imports in generated shadcn components with `@/` aliases.
- **Acceptance criteria:**
  - [ ] Zero `../../lib/utils` in `src/components/ui/`
  - [ ] `npm run build` passes

### TICKET-019: JSDoc Cleanup — Remove Ceremony from Non-.tsx Files
- **Type:** non-blocking
- **Severity:** low
- **Findings:** F-21, F-22
- **Files affected:**
  - `src/lib/rosbridge/ConnectionManager.ts` (remove JSDoc from private symbols)
  - `src/hooks/useControlPublisher/constants.ts` (remove trivial JSDoc)
  - `src/stores/connection/useConnectionStore.helpers.ts` (fix misaligned JSDoc)
  - Various other non-`.tsx` files with unnecessary JSDoc (grep audit)
- **Conflicts with:** none
- **Branch:** `fix/ticket-019/jsdoc-cleanup`
- **Scope:** Remove JSDoc from private module-scope variables and self-describing constants. Keep JSDoc only on `.tsx` exports. Fix orphaned `assignRobotColor` JSDoc.
- **Acceptance criteria:**
  - [ ] No JSDoc on private module-scope variables or trivial constants
  - [ ] All `.tsx` exported components retain JSDoc
  - [ ] Misaligned `assignRobotColor` JSDoc fixed
  - [ ] `npm run build` passes

### TICKET-020: Fix WebRTC Circular Closure and video.play Error Logging
- **Type:** non-blocking
- **Severity:** low
- **Findings:** F-25, F-26
- **Files affected:**
  - `src/hooks/useWebRtcStream/useWebRtcStream.ts` (refactor closures, fix catch)
- **Conflicts with:** none
- **Branch:** `fix/ticket-020/webrtc-reconnect-cleanup`
- **Scope:** Break `scheduleReconnect`/`connect` mutual closure. Fix `video.play().catch` to log non-autoplay errors.
- **Acceptance criteria:**
  - [ ] `eslint-disable` at line 71 removed
  - [ ] No circular closure between `scheduleReconnect` and `connect`
  - [ ] `video.play().catch` logs non-`NotAllowedError` at `console.warn`
  - [ ] Unit tests: reconnect scheduling fires after disconnect; connect ref is not stale after re-render
  - [ ] Unit tests: `video.play` catch distinguishes `NotAllowedError` from other errors
  - [ ] ESLint and `npm run build` pass; all tests pass

### TICKET-021: Refactor Mobile Workspace Prop Relay with Context
- **Type:** non-blocking
- **Severity:** medium
- **Findings:** F-28
- **Files affected:**
  - `src/features/workspace/context/WorkspaceContext.tsx` (create)
  - `src/features/workspace/hooks/useWorkspaceContext.ts` (create)
  - `src/features/workspace/RobotWorkspace.tsx` (provide context)
  - `src/features/workspace/components/RobotWorkspaceMobile.tsx` (consume context)
  - `src/features/workspace/components/ActivePanelContent.tsx` (consume context)
- **Conflicts with:** TICKET-007, TICKET-012, TICKET-013 (all modify `RobotWorkspace.tsx` — must complete first), TICKET-016 (creates `ActivePanelContent.tsx` — must complete first)
- **Branch:** `fix/ticket-021/mobile-workspace-context`
- **Scope:** Create `WorkspaceContext`. Replace 3-level prop relay with context consumption.
- **Acceptance criteria:**
  - [ ] `WorkspaceContext` and `useWorkspaceContext` exist
  - [ ] `RobotWorkspaceMobile` receives only `robotId` — all data from context
  - [ ] `ActivePanelContent` reads from context, no data props
  - [ ] Desktop workspace behavior unchanged
  - [ ] Unit tests: `useWorkspaceContext` throws when used outside provider
  - [ ] Unit tests: context provides all expected workspace state fields
  - [ ] E2E: mobile workspace tab switching renders correct panel content
  - [ ] `npm run build` passes; all tests pass

---

## Execution Plan

### Wave 1 — Blocking (complete before all others)

**TICKET-001, TICKET-002**

TICKET-001 establishes final hook import paths (TICKET-003, TICKET-004, TICKET-009 depend on it). TICKET-002 renames constants files (TICKET-010 depends on it). Both must merge before Wave 2 begins.

### Wave 2 — Non-blocking (parallel after Wave 1)

**TICKET-003, TICKET-004, TICKET-005, TICKET-006, TICKET-007, TICKET-008, TICKET-010, TICKET-011, TICKET-015, TICKET-016, TICKET-018, TICKET-019, TICKET-020**

Serialization constraints within Wave 2:

| Conflict pair | Shared file | Order |
|---|---|---|
| TICKET-005 → TICKET-017 | `App.tsx` | TICKET-005 first; TICKET-017 is Wave 3 |
| TICKET-006 ↔ TICKET-015 | `useConnectionStore.types.ts` | Either order; second rebases |
| TICKET-004 → TICKET-014 | `LidarPanel.tsx` | TICKET-004 first; TICKET-014 is Wave 3 |
| TICKET-007 first on workspace path | `RobotWorkspace.tsx` | TICKET-007 before TICKET-012/013/021 |

### Wave 3 — Depends on Wave 2 completions

| Ticket | Depends on |
|---|---|
| TICKET-009 | TICKET-001, TICKET-003 |
| TICKET-012 | TICKET-007 |
| TICKET-013 | TICKET-007 |
| TICKET-014 | TICKET-004 |
| TICKET-017 | TICKET-005 |
| TICKET-021 | TICKET-007, TICKET-012, TICKET-013, TICKET-016 |
