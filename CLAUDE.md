# Robot Telemetry Dashboard — V4

## Process

Freeform pair programming for execution. Checkpoint after every feature — user sees rendered output and approves before proceeding. Always consult user on uncertainties or assumptions before implementing.

### Development Pipeline

When the user says "run this through our development process," execute ALL steps. Steps marked (enforced) produce artifacts — skipping them is a process failure.

| Step | What | Who | Output |
|------|------|-----|--------|
| 1. **Discuss** | Approaches, trade-offs, tickets | Pair | Agreed direction |
| 2. **Snapshot** (enforced) | Capture baseline: test count, lint errors, build status | Script | `.planning/snapshots/pre-{branch}.md` |
| 3. **Plan** | Break into tickets, identify parallelism, blockers | Pair | `ISSUES.md` updated |
| 4. **Dispatch** (enforced) | Agents execute tickets, log every event | Agents | `.planning/dispatch-logs/{wave}.md` |
| 5. **Review** | PR reviewer posts inline comments on every finding | Agent | PR comments (feeds self-improvement loop) |
| 6. **Fix** | PR responder addresses all findings, replies to every comment | Agent | Commits pushed |
| 7. **Merge** | Through GitHub PRs only — never local `git merge` | `gh pr merge` | PR closed |

### Branch Strategy

- All work happens on an EPIC branch (e.g., `EPIC/general-house-keeping`).
- Feature/fix branches are created from and PR'd back into the EPIC branch — never directly to `main`.
- When the EPIC is complete, a single PR merges the EPIC branch into `main`.
- Agent dispatch prompts must always specify the EPIC branch as the PR base (`--base EPIC/...`).
- Before dispatching agents, confirm which EPIC branch to target.
| 8. **Scorecard** (enforced) | Delta from baseline: what changed, regressed, caught in review | Script/overseer | `.planning/scorecards/{branch}.md` |
| 9. **Session report** | End-of-session summary: agents, findings, process failures, metrics | `/retro` | `.planning/session-reports/{date}.md` |

### Observability

- **Dispatch log** — append-only, one per wave. Every dispatch, completion, skip, and failure gets logged with timestamp.
- **Pre-cycle snapshot** — test count, lint errors, build status captured before agent work begins.
- **Post-cycle scorecard** — delta from snapshot: what improved, what regressed, what review caught.
- **Session report** — generated at end of session. Covers agent performance, process failures, convention violations, metrics.
- **Overseer** — reads dispatch log, builds step matrix per ticket, flags MISSING/SKIPPED/FAILED steps.

### Execution Rules

- **Visual work pipeline.** Before touching any `.tsx` file for a visual change, follow all 5 steps in order:
  1. **Discuss** — present approaches and trade-offs to the user
  2. **Research** — query `ui-ux-pro-max` for design intelligence (layout patterns, component styles, accessibility)
  3. **Approve** — get explicit user "go ahead" on the direction informed by research
  4. **Implement** — invoke `/frontend-design` for aesthetic guidance, then write code
  5. **Verify** — visual check before claiming done
- **Self-audit before presenting.** After creating or editing any file, re-read it against the Pre-Write Checklist and Code Conventions before claiming it's done. Do not move to the next file until the current one passes all rules.
- **Build features as verticals, not horizontal slices.** Each feature built end-to-end (types → store → hook → component → tests → visual verification → checkpoint) before starting the next. Never build all stores, then all hooks, then all components.
- **Research tools FIRST.** Query context7, ui-ux-pro-max, /frontend-design BEFORE proposing any solution. Do not propose from own knowledge then validate — tools first, then recommendations. Apply the research findings when writing code.
- **Visual work executes inline.** Never delegate visual components to parallel subagents — they cannot invoke `/frontend-design` or `ui-ux-pro-max`.
- **Discuss everything first.** Before code: what it looks like, how it works, edge cases. Consult user on every uncertainty or assumption — especially visual/behavioral trade-offs.
- **Verify visually.** Must view rendered output (Playwright MCP or dev server) before claiming visual work is done. Code that compiles is not code that looks right.
- **/clear between major features.** Fresh context.

### UI Tool Chain (MANDATORY for visual work)

| Step | Tool               | Purpose                                                                          | When                                  |
| ---- | ------------------ | -------------------------------------------------------------------------------- | ------------------------------------- |
| 1    | `ui-ux-pro-max`    | Design intelligence — layout patterns, component styles, palettes, accessibility | Before designing (informs options)    |
| 2    | `/frontend-design` | Aesthetic implementation filter — anti-AI-slop, distinctive execution            | Before coding (guides how to build)   |
| 3    | `context7`         | Library docs — shadcn/Tailwind/React API specifics                               | During coding (API details)           |
| 4    | **Playwright MCP** | Visual verification — screenshots at 1280x800 + 375x812                          | After coding (verify rendered output) |

### Pre-Write Checklist

Before writing ANY component file, verify:

- [ ] Can shadcn handle this? Check shadcn components first
- [ ] No constants/config objects inline — extract to `.constants.ts`
- [ ] No JSX comments describing children — extract to named subcomponents
- [ ] 3+ subcomponents → own folder
- [ ] Types in `.types.ts`, not inline
- [ ] All colors via Tailwind utilities, not var() or hardcoded
- [ ] Font sizes strictly 12/14/20/36px
- [ ] Canonical Tailwind classes, not arbitrary `[value]` — use `p-3` not `p-[12px]`
- [ ] Interactive elements have cursor-pointer, transition, focus-visible

## Reference Docs

| Topic            | Document                                             | What it covers                                                                                         |
| ---------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Styling & Tokens | [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md)       | Colors, typography, spacing, panel contract, animations, buttons, empty states, responsive breakpoints |
| Folder Structure | [docs/FOLDER-STRUCTURE.md](docs/FOLDER-STRUCTURE.md) | Feature domains, file naming, scoping rules, shadcn-first, constants/helpers conventions               |
| Testing          | [docs/TESTING.md](docs/TESTING.md)                   | Co-location, unit tests, integration tests, E2E, quality gate                                          |
| Code Conventions | [docs/CODE-CONVENTIONS.md](docs/CODE-CONVENTIONS.md) | File structure, imports, naming, comments, components, state management, semantic HTML, PR conventions  |
| Dev Workflow     | [docs/DEVELOPMENT-WORKFLOW.md](docs/DEVELOPMENT-WORKFLOW.md) | Pair programming pipeline, 5-role agent team, audit process, wave ordering, PR conventions       |

These docs are the source of truth. CLAUDE.md does not duplicate their content.

## Agents

Project-level agent definitions live in `.claude/agents/`. These are the team roles used by the development pipeline.

| Agent | File | Role |
|-------|------|------|
| Codebase Auditor | `.claude/agents/codebase-auditor.md` | Read-only audit, produces structured findings |
| Codebase Fixer | `.claude/agents/codebase-fixer.md` | Implements fixes per ticket in isolated worktrees |
| PR Reviewer | `.claude/agents/pr-reviewer.md` | First-tier PR review, inline comments only, never merges |
| PR Responder | `.claude/agents/pr-responder.md` | Addresses review feedback, replies to every comment |
| Spec Conformance | `.claude/agents/spec-conformance.md` | Checks code against CODE-CONVENTIONS.md |
| Overseer | `.claude/agents/overseer.md` | Post-cycle audit: dispatch log, scorecard, agent performance |
| Branch Guardian | `.claude/agents/branch-guardian.md` | Pre-dispatch: clean stale worktrees, validate branches |
| Ticket Reviewer | `.claude/agents/ticket-reviewer.md` | Pre-dispatch: detect file conflicts, validate scoping |

## Observability (`/.planning/`)

`.planning/` is the observability hub — not for project planning (that's `ISSUES.md` and `docs/`).

| Directory | Purpose |
|-----------|---------|
| `dispatch-logs/` | Append-only logs per wave/EPIC |
| `snapshots/` | Pre-cycle baseline captures |
| `scorecards/` | Post-cycle deltas |
| `session-reports/` | End-of-session summaries |
| `archive/` | Historical phase summaries, research, specs |

Source of truth for tickets: root `ISSUES.md` (not `.planning/ISSUES.md`).

## Code Conventions

See [docs/CODE-CONVENTIONS.md](docs/CODE-CONVENTIONS.md) for the full rule set.

## Connection Behavior

- **Do NOT auto-connect on startup.** Show fleet empty state with "Add Robot" CTA.
- **Sidebar robot list reads from connection store** — not hardcoded.

## Architecture

- **Data layer:** roslib 2.x (pure ESM) → RxJS (streams) → Zustand (UI state). No React Context for state — Zustand only.
- **Panels own subscriptions** — each panel receives `ros` + `connected` + `topicName` and calls its own subscription hooks internally. Workspace is a layout orchestrator, not a data coordinator.
- **Design:** Midnight Operations aesthetic (deep blue-shifted charcoal + blue accent, hue 260)
- **Stack:** React 19, TypeScript 5.9, Vite 7, Tailwind CSS v4, shadcn/ui + Radix, Vitest, Playwright
- **Fonts:** Exo (UI sans-serif) + Roboto Mono (telemetry data)
- **Icons:** Lucide React (shadcn default, tree-shakeable SVG)

## Commit Style

- No Co-Authored-By lines
- No AI mention
- Focus on changes + impact only

## Enforcement (warnings → hard blocks)

- `npm run validate:tokens` — checks for hardcoded oklch/hex/rgb in `.tsx` files
- `scripts/check-conventions.sh` — deep barrel imports, duplicate module imports, inline types, missing JSDoc
- Pre-commit: lint-staged (eslint, prettier, convention checks)
- Pre-push: `npm run build` + `vitest run`
- ESLint — naming conventions, import patterns, no banned patterns

## Gotchas

- roslib 2.x is pure ESM — use named imports: `import { Ros, Topic } from 'roslib'`
- Barrel files: `@/hooks`, `@/utils`, `@/components/controls` + feature-level `./components`, `./hooks` barrels exist. Always import from barrel, never bypass with deep paths.
- Dynamic rowHeight infinite loop (ISS-008) — use `window.innerHeight` for lg, static for md/sm
- Canvas 2D cannot resolve CSS vars directly — use `getComputedStyle()` fallback pattern
- Always gitignore BEFORE creating files with secrets
- Token namespace: only `--color-surface-*`, `--color-text-*`, `--color-accent*`, `--color-status-*`, `--color-border*` exist — never invent new namespaces
- Tailwind v4 theming: colors in `:root`/`[data-theme]`, token names registered via `@theme inline` — never put colors directly in `@theme`
