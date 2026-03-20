# Issues & Enhancements

## Open

### ISS-001: Views render placeholders instead of built mode components (v2 repeat)

- **Phase:** 6.1 (INSERTED)
- **Priority:** Critical
- **Type:** Integration gap
- **Description:** Phase 6 built DashboardMode, PilotMode, EngineerMode with 132 tests — all passing. But DashboardView.tsx still renders "Panels coming in Phase 6" placeholder. FleetView and MapView also show placeholders. The router serves placeholder views, not the real mode components. This is the EXACT same bug as v2's overnight build integration gap (ISS-008 in v2 ISSUES.md).
- **Root cause:** TDD tests tested mode components in isolation but no E2E test verified that the VIEW (via router) renders the REAL component.
- **Prevention:** Added integration-verification-rule to memory. All future phases must include view-level E2E tests.
- **Discovered:** 2026-03-20 during visual inspection
- **Status:** Closed — fixed in Phase 6.1 (2026-03-20)

## Closed

### ISS-001: Views render placeholders instead of built mode components

- **Closed:** 2026-03-20
- **Fix:** Phase 6.1 — DashboardView wired to ModeSwitcher + mode components, FleetView/MapView replaced with real content
