---
phase: 1
slug: scaffolding
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-23
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.x + Playwright 1.58.x |
| **Config file** | `vitest.config.ts` (Wave 0) + `playwright.config.ts` (Wave 0) |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npm run lint && npx tsc --noEmit && npx vitest run && npx playwright test e2e/visual-gate.spec.ts && npm run build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run && npx tsc --noEmit`
- **After every plan wave:** Run `npm run lint && npx tsc --noEmit && npx vitest run && npx playwright test e2e/visual-gate.spec.ts && npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Criteria | Test Type | Automated Command | File Exists | Status |
|---------|------|------|----------|-----------|-------------------|-------------|--------|
| 01-01-T1 | 01 | 1 | SC-1, SC-2 | Build | `npm run build` | N/A (npm script) | ⬜ pending |
| 01-01-T2 | 01 | 1 | SC-1, SC-2 | Lint+Build | `npm run lint && npm run build` | N/A (npm script) | ⬜ pending |
| 01-02-T1 | 02 | 2 | SC-3, SC-5 | Unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-02-T2 | 02 | 2 | SC-1, SC-4 | E2E | `npx playwright test e2e/visual-gate.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — test runner configuration (created in Plan 01-02 Task 1)
- [ ] `playwright.config.ts` — E2E test configuration (created in Plan 01-02 Task 2)
- [ ] `src/test-setup.ts` — shared test setup with jest-dom matchers (created in Plan 01-02 Task 1)
- [ ] `e2e/visual-gate.spec.ts` — living quality gate (created in Plan 01-02 Task 2)
- [ ] `src/__tests__/roslib-smoke.test.ts` — roslib ESM import verification (created in Plan 01-02 Task 1)
- [ ] Playwright browsers: `npx playwright install chromium`

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
