# Issues — General Housekeeping (Audit 2)

Consolidated from 5 parallel audits (architecture, quality, safety, performance, coverage) on 2026-04-03.
Previous audit tickets TICKET-001 through TICKET-024; merged: T-001, T-002, T-003, T-006, T-007, T-007-v2, T-012, T-014, T-015-v2, T-016. Rejected: T-021 (no Context). Remaining old tickets superseded by this fresh audit.

---

## Tickets

### Wave 1 — Blocking (COMPLETE)

- T-025: Fix shared→feature import boundary violations — PR #24 MERGED
- T-026: Add cancel() to rafThrottle and clean up on unmount — PR #27 MERGED
- T-027: Handle ConnectionManager.connect rejection — PR #25 MERGED
- T-028: Publish ZERO_TWIST on useControlPublisher unmount — PR #26 MERGED

### Wave 2 — Code Quality + Performance

#### T-029: Migrate workspace canvas components to useCanvasColors
- Severity: HIGH
- Files: `src/features/workspace/components/TelemetryPanel.tsx`, `src/features/workspace/components/LidarPanel.tsx`, `src/features/workspace/components/ImuPanel/components/CompassHeading.tsx`, `src/features/workspace/components/ImuPanel/components/WireframeView.tsx`, `src/features/workspace/components/ImuPanel/components/AttitudeIndicator.tsx`
- Scope: Replace inline colorsRef/resolveColors/themeVersion with useCanvasColors hook. Replace hardcoded OKLCH with CANVAS_FALLBACKS.
- Acceptance: Zero inline getComputedStyle in workspace canvas components. All use useCanvasColors. Tests verify hook integration.
- Conflicts: T-033 depends on this (both touch LidarPanel.tsx)
- Branch: `fix/t-029/workspace-use-canvas-colors`

#### T-030: Remove unused production dependencies
- Severity: HIGH
- Files: `package.json`
- Scope: `npm uninstall d3 gsap next-themes observable-hooks react-grid-layout recharts rxjs react-is`
- Acceptance: None of these packages in dependencies. Build succeeds. Test confirms no imports of removed packages.
- Branch: `chore/t-030/remove-unused-deps`

#### T-031: Route-level code splitting
- Severity: HIGH
- Files: `src/App.tsx`
- Scope: React.lazy + Suspense for LandingPage, FleetOverview, RobotWorkspace, PilotView, MockupsPage.
- Acceptance: Each route loads as separate chunk. Build shows multiple chunks. Test confirms lazy loading setup.
- Branch: `perf/t-031/route-code-splitting`

#### T-032: Extract StatusDot and GyroInline from PilotHudMobile
- Severity: HIGH
- Files: `src/features/pilot/components/PilotHudMobile.tsx` (+ new StatusDot.tsx, GyroInline.tsx)
- Scope: Extract to own files per one-component-per-file rule.
- Acceptance: One component per .tsx file. Tests verify components render.
- Branch: `refactor/t-032/pilot-hud-mobile-extract`

#### T-033: Fix LidarPanel Math.min stack overflow risk
- Severity: MEDIUM
- Files: `src/features/workspace/components/LidarPanel.tsx:228`
- Scope: Replace Math.min(...points.map(...)) with for-loop.
- Acceptance: No spread operator on points array. Test with large array.
- Conflicts: Run after T-029
- Branch: `fix/t-033/lidar-min-overflow`

#### T-034: Fix telemetry ring buffer copy
- Severity: MEDIUM
- Files: `src/features/workspace/hooks/useTelemetrySubscription.ts:191`
- Scope: Store data in ref, use frame-synced counter for redraws.
- Acceptance: No [...buf] spread on every message. Test verifies ref-based approach.
- Conflicts: Run after T-037
- Branch: `perf/t-034/telemetry-ringbuf-ref`

#### T-035: Add useMemo to PilotView render-path allocations
- Severity: MEDIUM
- Files: `src/features/pilot/PilotView.tsx:44-57`
- Scope: useMemo for lidar points map and telemetry object.
- Acceptance: Both values memoized with correct deps. Test verifies memoization.
- Branch: `perf/t-035/pilot-view-memoize`

#### T-036: Validate RTCSdpType with z.enum
- Severity: MEDIUM
- Files: `src/lib/webrtc/signaling.ts:34`
- Scope: Replace z.string() with z.enum(["offer","answer","pranswer","rollback"]). Remove as RTCSdpType cast.
- Acceptance: No type assertion on SDP type. Test verifies enum validation.
- Branch: `fix/t-036/rtc-sdp-enum`

#### T-037: Extract duplicate constants to shared
- Severity: MEDIUM
- Files: `src/features/workspace/constants.ts`, `src/features/pilot/constants.ts`, `src/hooks/useImuSubscription.ts`, `src/features/workspace/hooks/useTelemetrySubscription.ts`
- Scope: Move COMPASS_CARDINALS, LIDAR_POINT_RADIUS to src/constants/. Move vector3Schema to src/types/ros2-schemas.ts.
- Acceptance: No duplicate definitions across features. Tests verify exports.
- Branch: `refactor/t-037/extract-shared-constants`

#### T-038: Delete barrel file and re-export
- Severity: MEDIUM
- Files: `src/features/workspace/types/panel.types.ts`, `src/features/pilot/types/PilotView.types.ts:4`
- Scope: Delete barrel file. Remove VideoStreamStatus re-export.
- Acceptance: No barrel files or unnecessary re-exports. Test verifies no barrel imports.
- Branch: `chore/t-038/remove-barrel-reexports`

#### T-039: Extract inline types to types files
- Severity: MEDIUM
- Files: `src/components/ErrorBoundary.tsx`, `src/components/PanelErrorBoundary.tsx`, `src/features/pilot/components/PilotStatusBar/BatteryRow.tsx`, `src/components/DesktopOnlyGate.tsx`
- Scope: Create types files, move interfaces.
- Acceptance: No interface/type definitions in .tsx files. Tests verify type imports.
- Branch: `refactor/t-039/extract-inline-types`

#### T-040: Add post-unmount guards to useRosGraph and useRosTopics
- Severity: MEDIUM
- Files: `src/hooks/useRosGraph.ts`, `src/hooks/useRosTopics.ts`
- Scope: Add aborted ref, check before setState.
- Acceptance: No setState calls after cleanup runs. Tests verify cleanup behavior.
- Branch: `fix/t-040/unmount-guards`

### Wave 3 — Test Coverage

#### T-041: Test ConnectionManager
- Severity: CRITICAL
- Files: `src/lib/rosbridge/__tests__/ConnectionManager.test.ts` (new)
- Scope: Mock roslib Ros. Test connect, disconnect, reconnect, timeout, intentional disconnect guard, max attempts.
- Acceptance: 6+ test cases covering all async paths.
- Branch: `test/t-041/connection-manager`

#### T-042: Test pure utility functions
- Severity: HIGH
- Files: `src/utils/formatDegrees.test.ts`, `src/utils/formatLastSeen.test.ts`, `src/utils/formatUptime.test.ts`, `src/utils/getBatteryColor.test.ts`, `src/utils/normalizeHeading.test.ts`, `src/utils/withAlpha.test.ts` (all new)
- Scope: Co-located test files for 6 pure utilities. NOTE: rafThrottle.test.ts already exists from T-026, skip it.
- Acceptance: All utility functions tested with edge cases.
- Branch: `test/t-042/utility-tests`

#### T-043: Test fleet helpers and schemas
- Severity: MEDIUM
- Files: `src/features/fleet/helpers.test.ts` (new), `src/features/fleet/schemas.test.ts` (new)
- Scope: Test normalizeRosbridgeUrl (6 branches), addRobotSchema constraints.
- Acceptance: All URL protocols and edge cases covered.
- Branch: `test/t-043/fleet-helpers-schemas`

#### T-044: Expand useConnectionStore tests
- Severity: MEDIUM
- Files: `src/stores/connection/__tests__/useConnectionStore.test.ts`
- Scope: Add removeRobot, updateRobot, setRobotTopic tests. Add deriveRosbridgeUrl, deriveWebRtcUrl, assignRobotColor helper tests. NOTE: connectRobot rejection tests already exist from T-027, skip those.
- Acceptance: All store actions and helpers tested.
- Branch: `test/t-044/store-actions`

#### T-045: Test calculateBackoffDelay and buildTwist
- Severity: MEDIUM
- Files: `src/constants/reconnection.test.ts` (new), `src/hooks/useControlPublisher/helpers.test.ts` (new)
- Scope: Backoff boundaries (attempt 0, 1, cap). Twist direction signs and stop.
- Acceptance: All branches covered.
- Branch: `test/t-045/backoff-twist`

#### T-046: Test subscription hook behavior
- Severity: HIGH
- Files: `src/hooks/useBatterySubscription.test.ts` (new), `src/hooks/useImuSubscription.test.ts` (new), `src/hooks/useLidarSubscription.test.ts` (new)
- Scope: Mock useRosSubscriber. Test state updates, percentage normalization, cleanup.
- Acceptance: Hook behavior tested, not just schemas.
- Branch: `test/t-046/subscription-hooks`

#### T-047: Test useMinimizedPanels
- Severity: HIGH
- Files: `src/features/workspace/hooks/__tests__/useMinimizedPanels.test.ts` (new)
- Scope: renderHook tests for minimize, maximize, restore, restoreAll.
- Acceptance: All 6 methods tested with state verification.
- Branch: `test/t-047/minimized-panels`

#### T-048: Test SignalingClient
- Severity: MEDIUM
- Files: `src/lib/webrtc/__tests__/signaling.test.ts` (new)
- Scope: Mock fetch. URL conversion, success, HTTP error, malformed JSON, Zod failure.
- Acceptance: All code paths covered.
- Branch: `test/t-048/signaling-client`

### Wave 4 — Mechanical Sweeps (deferred to next session)

- T-049: Import ordering sweep
- T-050: Styled comment removal sweep
- T-051: Object key and props alphabetization sweep
- T-052: MIL-STD-1472H status indicator compliance (visual work)
- T-053: Performance memoization sweep
- T-054: Miscellaneous LOW fixes

---

## Execution Plan

### Wave 1 (COMPLETE)
All 4 tickets merged (PRs #24, #25, #26, #27).

### Wave 2 — Sequential execution, 3 phases

**Phase A** (no shared files): T-030 → T-031 → T-036 → T-038
**Phase B** (after Phase A): T-029 → T-032 → T-035 → T-037 → T-039 → T-040
**Phase C** (dependencies): T-033 (after T-029) → T-034 (after T-037)

| Serialization constraint | Shared file | Order |
|--------------------------|-------------|-------|
| T-029 → T-033 | `LidarPanel.tsx` | T-029 first |
| T-037 → T-034 | `useTelemetrySubscription.ts` | T-037 first |

### Wave 3 — Sequential execution
T-041 → T-042 → T-043 → T-044 → T-045 → T-046 → T-047 → T-048

All create new test files. No source modifications.

### Wave 4 — Deferred
Sweeps run after Waves 1-3 merge. Saved for next session.
