# V4 Process Design — Disciplined Autonomy

**Date:** 2026-03-22
**Status:** Active — operating manual for v4 build

---

## 1. Problem Statement

The robot-telemetry-dashboard has failed three times (v1, v2, v3). Each iteration correctly diagnosed the previous failure but introduced new failure modes.

**The v3 Phase 8 catastrophe:** 468 tests passing, AI reviewer scoring 7/8/8, but the app was completely broken and ugly. The problem isn't code quality — it's process quality.

### Root Cause Chain

| Step | What Happened | Root Cause |
|------|--------------|------------|
| Scope | Phase 8 = 8+ concerns in one phase | `confirm_roadmap: false` — no human reviewed scope |
| Design | No visual mockup shown before code | Mockup gate was a memory rule, not enforced |
| Dark theme | Missing for 7 phases | No automated visual assertion |
| Testing | 468 tests pass on broken app | Tests verify code behavior, not visual output |
| AI Review | Scored 7/8/8 on blank screen | AI evaluated DOM structure, not rendered pixels |
| Human review | User saw it only at Done Definition | `confirm_transition: false` — no human gate |

**The #1 root cause:** `config.json` has ALL gates set to `false`. Process rules exist in 13+ memory files but there is **no enforcement mechanism**. Memory rules are advisory. Gates are structural.

---

## 2. GSD Configuration

```json
{
  "mode": "yolo",
  "gates": {
    "confirm_project": true,
    "confirm_phases": true,
    "confirm_roadmap": true,
    "confirm_breakdown": true,
    "confirm_plan": true,
    "execute_next_plan": true,
    "issues_review": true,
    "confirm_transition": true
  },
  "safety": {
    "always_confirm_destructive": true,
    "always_confirm_external_services": true
  },
  "granularity": "fine"
}
```

**All gates enabled.** YOLO mode stays on (autonomous execution within phases), but every transition point requires human approval.

### Gate Responsibilities

| Gate | What It Does |
|------|-------------|
| `confirm_project` | Approve project definition before anything starts |
| `confirm_phases` | Approve phase list (scope check) |
| `confirm_roadmap` | Approve roadmap ordering and dependencies |
| `confirm_breakdown` | Approve task breakdown within a phase |
| `confirm_plan` | Approve implementation plan before code starts |
| `execute_next_plan` | Approve moving to next plan within a phase |
| `issues_review` | Review issues before they're closed |
| `confirm_transition` | Approve phase completion with visual evidence |

**Cost of unnecessary checkpoint: 2 seconds. Cost of missed checkpoint: entire phase of wasted work.**

---

## 3. Phase Classification

Every phase gets a type tag. All phases get human checkpoints, but the type determines what the human reviews.

| Type | Description | Human Reviews | Quality Gate |
|------|------------|--------------|--------------|
| `logic` | Stores, services, hooks, RxJS, utilities | Test results + git diff summary | lint + tsc + vitest + visual assertions + build |
| `visual` | Components, layouts, themes, styling | Screenshots (desktop + mobile) + diff | Same as logic + screenshots presented to human |
| `integration` | Wiring views, routes, layout restructuring | Route-by-route screenshots + diff | Same as visual + route smoke tests |

---

## 4. Quality Gate (Every Phase)

```bash
# Automated (ALL phases)
npm run lint                                    # 0 errors, 0 warnings
npx tsc --noEmit                                # 0 errors
npm test -- --run                               # all pass
npx playwright test e2e/visual-gate.spec.ts     # automated visual assertions
npm run build                                   # clean build
```

### Human Review (visual/integration phases only)

Agent captures Playwright screenshots at 2 viewports:
- Desktop: 1280x800
- Mobile: 375x812

Agent presents: screenshots + `git diff --stat` + one-sentence summary.
Human responds: `pass` or `fail: [notes]`.

---

## 5. Automated Visual Safety Net

File: `e2e/visual-gate.spec.ts`

Seven assertion categories — hard test failures, not AI scores:

1. **Dark theme active (all routes)** — html has `class="dark"` or `data-theme` containing "dark"
2. **No blank pages (semantic)** — each route renders ≥15 visible elements + route-specific `data-testid` landmarks
3. **No placeholder text (expanded)** — 10 patterns including "stub", "temporary", "work in progress", "sample data"
4. **No hardcoded colors (all palettes)** — checks slate, gray, zinc, neutral, stone classes
5. **Screenshot capture** — desktop (1280x800) + mobile (375x812) saved to `.planning/screenshots/`
6. **Background not white (all routes)** — body background is not `#fff` or transparent
7. **No console errors** — `page.on('pageerror')` and `console.error` count must be zero

**Route manifest:** Routes loaded from `e2e/routes.json` (not hardcoded). Update the manifest when adding/changing routes. Each entry includes `landmarks[]` — `data-testid` values that must be visible on that route.

**Config integrity:** `scripts/validate-gates.sh` validates all gates are `true`. Install as pre-commit hook.

---

## 6. Phase Scope Rules

Enforced at `confirm_roadmap` gate:

1. **One concern per phase** — described in one sentence
2. **Max 5 new components** per phase
3. **No "and" stacking** — if description has 2+ "and"s, split it
4. **No combined structural + visual phases** — never touch navigation structure AND visual design in same phase
5. **Every phase leaves the app working** — no "build now, wire later"

---

## 7. Agent Pipeline

### Logic phases (`logic`)

**Before:** context7 MCP research (only if phase uses new APIs/libraries)
**During:** Single expert agent, TDD workflow
**After:** Automated quality gate → human "go"

### Visual/Integration phases (`visual`, `integration`)

Six-step tool chain — every step is mandatory, in order:

```
Step 1: UI-SPEC.md          /gsd:ui-phase
        ↓                   Generates design contract with render rules,
        ↓                   responsive behavior, states, acceptance criteria.
        ↓                   6-dimension quality checker validates the spec.
        ↓
Step 2: Design System       /ui-ux-pro-max
        ↓                   Color, typography, spacing, layout decisions.
        ↓                   References defense-contractor aesthetic.
        ↓                   Outputs specific token values and patterns.
        ↓
Step 3: Component Source     21st.dev Magic MCP
        ↓                   Pull from curated component registry.
        ↓                   No hallucinated components — real, tested code.
        ↓                   Skip if component is too custom for registry.
        ↓
Step 4: Implementation       /frontend-design
        ↓                   Production-grade code with anti-AI-slop filter.
        ↓                   Must follow UI-SPEC.md contract from Step 1.
        ↓                   Uses design tokens from Step 2, not hardcoded values.
        ↓
Step 5: Visual Audit         /gsd:ui-review
        ↓                   6-pillar retroactive audit of implemented code.
        ↓                   Scores: AI Slop, Defense Aesthetic, Polish.
        ↓                   Must score 7+ on all dimensions to proceed.
        ↓
Step 6: Screenshots          Playwright MCP
                             Desktop (1280x800) + Mobile (375x812).
                             Saved to .planning/screenshots/.
                             Presented to human at confirm_transition gate.
```

**Orchestrator rules:**
- Orchestrator (main context) does NOT write code — plans, dispatches, verifies
- Single expert agent for focused work (default)
- Multi-agent dispatch only for phases touching 3+ domains
- context7 MCP for up-to-date library docs (shadcn/ui, Radix, Tailwind)

---

## 8. Human Checkpoint Protocol

### Logic phases (`confirm_transition`)
```
Phase 5: ROS connection [logic]
Files changed: 8 | Tests: 42 new, 468 total | All gates: ✅
Summary: RxJS transport layer, topic discovery, connection store

Approve? (go / notes)
```

### Visual/integration phases (`confirm_transition`)
```
Phase 3: App shell [visual]
Files changed: 4 | Tests: 12 new, 120 total | All gates: ✅

Screenshots:
  📸 Desktop (1280x800) — [attached]
  📸 Mobile (375x812) — [attached]

Summary: Sidebar + header + main content area rendered in dark theme.

Approve? (pass / fail with notes)
```

---

## 9. Phase Scope Rules (Applied)

v3 Phase 8 "IA Redesign" would become:
```
8a: [visual]       Create sidebar component shell
8b: [integration]  Add fleet robot list to sidebar
8c: [visual]       Add nav items to sidebar
8d: [logic]        Make sidebar resizable with persistence
8e: [integration]  Replace header nav, update router
8f: [integration]  Create FleetOverview route
8g: [integration]  Create RobotWorkspace route
8h: [integration]  Remove old ModeSwitcher + BottomTabBar
8i: [visual]       Visual polish pass
```

---

## 10. Metrics Tracking

Tracked per-phase in `.planning/METRICS.md`:

| Metric | Purpose |
|--------|---------|
| First-pass rate | % of phases passing quality gate on first try |
| Rework cycles | Number of sub-phases per integer phase |
| Gate catch type | Which gate caught each issue |
| Human checkpoint time | Seconds per visual review (target <120s) |
| Agent count per phase | How many agents were dispatched |
| Phase duration | Wall-clock time per phase |
| False positive rate | Automated gates flagging non-issues |

---

## 11. V4 Roadmap (Micro-Phase Structure)

```
Phase 1:  [logic]        Foundation — Vite, React, TypeScript, ESLint, Vitest, Playwright
Phase 2:  [visual]       Design system — OKLCH tokens, dark theme, typography, shadcn/ui
Phase 3:  [visual]       App shell — sidebar + header + main content area
Phase 4:  [integration]  Router — 3 routes wired to shell
Phase 5:  [logic]        ROS connection — transport, discovery, RxJS streams
Phase 6:  [visual]       Fleet overview — robot cards, connection status, empty state
Phase 7:  [visual]       Telemetry widgets — IMU, LiDAR, DataPlot
Phase 8:  [integration]  Widget-to-panel wiring — widgets in robot workspace grid
Phase 9:  [visual]       Robot control — E-Stop, velocity sliders, D-pad
Phase 10: [visual]       Pilot view — camera feed placeholder, control overlay
Phase 11: [visual]       Map view — occupancy grid canvas, robot markers
Phase 12: [integration]  Final integration — all routes verified, E2E smoke tests, polish
```

---

## 12. Branch Strategy

```bash
git checkout main
git checkout -b EPIC/v4-rebuild
```

Nothing carried from v3 except:
- Memory files (in ~/.claude/, not in repo)
- Design system spec (`.planning/knowledge/specs/design-system-v3.md`)
- Code conventions (in memory: ADR-001 no barrels, ADR-002 domain stores)

---

## 13. Verification Checklist

- [ ] `.planning/config.json` has ALL gates set to `true`
- [ ] `e2e/visual-gate.spec.ts` exists with 5 assertion categories
- [ ] This spec document covers all sections
- [ ] Memory updated with v4 decisions
- [ ] `.planning/METRICS.md` has per-phase tracking structure
