# Workflow Preferences

## Orchestration Model

The main context window is the **orchestrator**. It does NOT write code directly — it plans, dispatches, and verifies. Expert agents execute.

**Fresh Start Rule:** Do NOT reuse old code. Only reference v1 for understanding patterns. Every component written fresh with expert agents.

## Before Each Phase (Research Gate)

Spawn 3 parallel background agents:

1. **Context agent** (Explore) — reads codebase docs, existing code, phase dependencies
2. **Investigation agent** (Explore) — explores unknowns, architectural decisions
3. **Research agent** (/research or research-analyst) — web search + context7 MCP for current docs

Do NOT proceed until all 3 complete.

## During Each Phase (Expert Dispatch)

1. Break into atomic subtasks
2. Dispatch to expert agents in parallel:
   - UI work → frontend-design skill, tailwind-frontend-expert, react-specialist
   - Architecture → code-architect, fullstack-developer
   - Testing → test-automator, qa-expert
   - Code review → code-reviewer (feature-dev or superpowers)
   - TypeScript → typescript-pro, react-specialist
3. Every piece of code gets a test — no exceptions
4. Use context7 MCP for current library docs
5. Use Playwright MCP for E2E testing

## After Each Phase (Quality Gate — MANDATORY)

Every phase must pass the full quality gate before proceeding. This is not optional.

### Step 1: File Audit

Spawn a **code-reviewer agent** to audit all files created or modified in this phase:

- List every file created, modified, or deleted
- Verify each file follows naming conventions (CLAUDE.md § Naming Conventions)
- Verify component rules: one component per .tsx, types in .types.ts, no default exports
- Flag any files that don't belong or were created unnecessarily

### Step 2: Spec Compliance Check

If the phase has an associated spec (in `docs/superpowers/specs/`) or PLAN.md:

- Compare implemented work against every requirement in the spec
- Flag any spec requirements not implemented
- Flag any implementation that deviates from the spec without justification
- Verify success criteria from the spec are met

### Step 3: Code Review

Dispatch **code-reviewer agent** (superpowers or feature-dev) on all changed files:

- Check for bugs, logic errors, security issues
- Verify adherence to CLAUDE.md conventions
- Check error handling patterns
- Verify no suppression patterns (@ts-ignore, eslint-disable, as any)

### Step 4: Test Verification

Run the full test suite:

```bash
npm run lint          # ESLint — must be 0 errors
npx tsc --noEmit     # TypeScript — must be 0 errors
npm test             # Vitest — all tests must pass
```

- Every new file must have a co-located test
- Every new function/hook/store action must be tested

### Step 5: E2E Playwright Tests

Run Playwright E2E tests on any relevant user flows:

```bash
npm run e2e          # All E2E smoke tests must pass
```

- If the phase touches a route or view, write/update E2E tests for that flow
- If the phase adds a new feature accessible via UI, add an E2E test
- Use Playwright MCP for interactive verification if needed

### Step 6: Remarks → Fix Phases

Collect ALL remarks (audit findings, spec deviations, code review issues, test failures, E2E failures) into a single report.

**If zero remarks:** Phase passes. Proceed to next phase.

**If any remarks exist:**

1. Create decimal sub-phases to fix them (e.g., phase 13 issues → 13.1, 13.2, etc.)
2. Each sub-phase addresses a specific set of related remarks
3. After each sub-phase completes, **re-run the full quality gate** (Steps 1-5)
4. Continue creating sub-phases until **zero remarks remain**
5. Only then proceed to the next integer phase

### Quality Gate Flow

```
Phase N complete
  → Step 1: File Audit
  → Step 2: Spec Compliance
  → Step 3: Code Review
  → Step 4: Test Verification (lint + typecheck + vitest)
  → Step 5: E2E Playwright
  → Remarks found?
    → YES: Create phase N.1 to fix → re-run gate
      → Still remarks? Create N.2 → re-run gate
      → Loop until zero remarks
    → NO: Proceed to Phase N+1
```

### Audit Report Format

The quality gate produces a structured report saved to `.planning/phases/{phase}/AUDIT.md`:

```markdown
# Phase {N} Quality Gate Audit

## File Audit

- Files created: {count}
- Files modified: {count}
- Convention violations: {list or "None"}

## Spec Compliance

- Spec: {path or "No spec"}
- Requirements met: {x}/{y}
- Deviations: {list or "None"}

## Code Review

- Issues found: {count}
- Critical: {list}
- Non-critical: {list}

## Test Results

- ESLint: {pass/fail}
- TypeScript: {pass/fail}
- Vitest: {pass/fail} ({x} tests)
- New tests added: {count}

## E2E Results

- Playwright: {pass/fail} ({x} tests)
- New E2E tests: {count}

## Verdict: {PASS | FAIL — {n} remarks}
```

## Blocker Handling Protocol

When hitting a blocker:

1. Spawn a dedicated research agent
2. Agent must find at least 5 viable options
3. Weigh pros and cons of each
4. Select best path with clear rationale
5. Log decision in .planning/ISSUES.md
6. Continue without user intervention — fully autonomous

## Code Structure Rules (Non-Negotiable)

1. One component per .tsx file
2. Types in {ComponentName}.types.ts — ALL types, even single-field interfaces
3. Comment-described sections become sub-component files
4. Named exports only (no default exports)
5. Barrel index.ts per feature for public API

## Git Workflow

- Branch: EPIC/v2-rebuild
- Base branch: EPIC/refactor-for-quality-of-life
- Commit format: feat(XX): description (where XX = phase number)
- Pre-commit: Husky + lint-staged (ESLint fix + Prettier)

## User Preferences

- YOLO mode preferred (autonomous execution with minimal interruption)
- Comprehensive depth over speed
- Professional-grade output — not "good enough"
- Defense-contractor aesthetic for all UI work
