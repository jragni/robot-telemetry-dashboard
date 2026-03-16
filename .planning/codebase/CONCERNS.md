# Codebase Concerns

**Analysis Date:** 2026-03-16

## Tech Debt

**Placeholder Views Never Completed:**

- Issue: DashboardView and MapView still contain stub text from early phases
- Files: `src/views/DashboardView.tsx` ("Phase 5 will add panels here"), `src/views/MapView.tsx` ("SLAM Map — Phase 10")
- Why: Overnight autonomous build created feature components but never wired them into these views
- Impact: Dashboard and Map routes show empty placeholder pages instead of functional panels/SLAM map
- Fix approach: Wire `PanelGrid` from `src/features/panels/` into DashboardView; wire `SlamMapWidget` from `src/features/slam/` into MapView

**Recording UI Has No Route or Panel Entry:**

- Issue: Recording feature (`src/features/recording/`) is fully implemented with services, hooks, and components but has no way to access it from the UI
- Files: `src/features/recording/components/RecordingControls.tsx`, `SessionList.tsx`, `PlaybackControls.tsx`
- Why: No panel type registered for recording, no route added
- Impact: Recording functionality is unreachable by users
- Fix approach: Register recording as a panel type in `src/features/panels/panel.registry.ts` or add to DashboardShell

**Console.error in Production Hooks:**

- Issue: Recording hooks use `console.error()` instead of structured logger
- Files: `src/features/recording/hooks/useRecording.ts` (3 instances)
- Why: Likely oversight during autonomous build
- Impact: Inconsistent logging, harder to filter in production
- Fix approach: Replace with `createLogger('useRecording')` from `src/lib/logger.ts`

**ROADMAP.md Progress Table Stale:**

- Issue: All 12 phases show "Not started" in the progress table despite being complete
- File: `.planning/ROADMAP.md` (lines 200-213)
- Why: Overnight build didn't update the progress tracking table
- Impact: Misleading project state for anyone reading the roadmap
- Fix approach: Update all phases to "Complete" status

## Known Bugs

**No runtime bugs detected.** All 510 tests pass, TypeScript and ESLint report 0 errors, production build succeeds.

## Security Considerations

**Hardcoded STUN Servers:**

- Risk: Google STUN servers hardcoded in config; if Google changes endpoints, WebRTC fails
- Files: `src/config/webrtc.ts` (5 Google STUN server URLs)
- Current mitigation: Standard, well-known Google STUN endpoints unlikely to change
- Recommendations: Make configurable via environment variables if deploying outside local networks

**No Input Sanitization on Robot URLs:**

- Risk: User-provided robot base URLs are used directly in WebSocket/HTTP connections
- Files: `src/features/connections/components/AddRobotForm.tsx`, `src/services/ros/RosTransport.ts`
- Current mitigation: Dashboard runs on local network, direct-connect model
- Recommendations: Add URL validation (protocol, hostname format) before connection attempt

## Performance Bottlenecks

**Large File Complexity:**

- Problem: `src/services/webrtc/WebRTCTransport.ts` is 473 lines with connection lifecycle, retry logic, timers, and generation counters in one file
- Measurement: Not a runtime issue, but maintenance/review cost
- Cause: Complex WebRTC state machine with many edge cases
- Improvement path: Extract retry/timeout logic into shared utility

**D3 Chart Rendering in Component:**

- Problem: `src/features/telemetry/data-plot/components/DataPlotWidget.tsx` (268 lines) mixes D3 SVG generation with React hooks
- Measurement: Not a runtime issue for current data volumes
- Cause: D3 imperative rendering doesn't fit React's declarative model cleanly
- Improvement path: Extract `drawChart()` into a custom hook or utility

## Fragile Areas

**IndexedDB Error Handling:**

- Files: `src/features/recording/recording.service.ts`
- Why fragile: IndexedDB error callbacks rely on `req.error?.message` which can be null/undefined inconsistently across browsers
- Common failures: Silent failures in Safari or older browsers
- Safe modification: Add fallback error messages for all error handlers
- Test coverage: Good — uses fake-indexeddb in tests, but doesn't cover cross-browser edge cases

**8-Slot Fixed Hook Pattern for Fleet:**

- Files: `src/features/fleet/` (fleet hooks)
- Why fragile: Uses fixed 8-slot hook array pattern to comply with Rules of Hooks for dynamic robot count
- Common failures: Exceeding 8 robots would silently ignore additional connections
- Safe modification: Document the limit clearly, consider alternative patterns for >8 robots
- Test coverage: Tested for expected robot counts

## Scaling Limits

**Multi-Robot Architecture:**

- Current capacity: Designed for 2-5 robots, architecture supports up to 8 (hook slot limit)
- Limit: 8 simultaneous robot connections due to fixed hook pattern
- Symptoms at limit: 9th+ robot connections silently ignored
- Scaling path: Replace fixed hook slots with dynamic subscription pattern or store-based approach

**OccupancyGrid Bandwidth:**

- Current capacity: On-demand fetch pattern handles one map at a time efficiently
- Limit: Continuous subscription would be 40-600KB per update
- Symptoms at limit: Network saturation on slow connections
- Scaling path: Already mitigated by on-demand fetch pattern in `src/features/slam/`

## Dependencies at Risk

**roslib 1.4.1:**

- Risk: CommonJS module requires special Vite config workaround
- Files: `vite.config.ts` (optimizeDeps include for roslib)
- Impact: Vite version upgrades may break roslib bundling
- Migration plan: Monitor roslib for ESM support; maintain Vite workaround

**react-grid-layout 2.2.2:**

- Risk: Relatively niche library for panel grid; last major release gap could be concerning
- Impact: Panel drag-and-drop functionality depends entirely on this library
- Migration plan: dnd-kit as alternative if react-grid-layout becomes unmaintained

## Missing Critical Features

**No Demo/Mock Data Mode:**

- Problem: Dashboard requires live ROS2 robot connection to show any data
- Current workaround: Users must connect to real robots or see empty panels
- Blocks: Demos, screenshots, development without robot hardware
- Implementation complexity: Medium — add mock data providers that emit sample ROS messages

## Test Coverage Gaps

**View-Level Integration:**

- What's not tested: DashboardView, MapView, FleetView rendering with real feature components
- Risk: Placeholder views prove the wiring was never tested
- Priority: High (directly caused the incomplete dashboard issue)
- Difficulty to test: Low — standard component rendering tests

**Cross-Browser IndexedDB:**

- What's not tested: Recording service behavior in Safari, Firefox, mobile browsers
- Risk: IndexedDB edge cases differ across browsers
- Priority: Medium
- Difficulty to test: Medium — requires browser-specific test environments

---

_Concerns audit: 2026-03-16_
_Update as issues are fixed or new ones discovered_
