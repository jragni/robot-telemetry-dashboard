# Development Workflow

Two modes of development: pair programming for feature work, agent teams for audits and housekeeping.

## Pair Programming (Features)

For any new feature or visual change, follow this pipeline in order:

1. Discuss — present approaches and trade-offs before writing code
2. Research — query ui-ux-pro-max for design intelligence, context7 for library docs
3. Approve — get explicit user go-ahead on the direction
4. Implement — invoke /frontend-design for aesthetic guidance, then write code
5. Verify — view rendered output (Playwright MCP or dev server) before claiming done

Build features as verticals, not horizontal slices. Each feature is built end-to-end (types, store, hook, component, tests, visual verification, checkpoint) before starting the next.

Visual work executes inline. Never delegate visual components to parallel subagents — they cannot invoke /frontend-design or ui-ux-pro-max.

## Agent Team (Audits and Housekeeping)

For codebase audits, bulk refactors, and housekeeping tickets, use the 10-role agent team.

### Roles

| Role | What it does | Constraints |
|------|-------------|-------------|
| Codebase Auditor | Scans codebase for issues in a specific concern area | Read-only, structured findings output |
| Codebase Fixer | Implements one ticket per worktree, creates PR | Must pass build, follow CODE-CONVENTIONS.md |
| PR Reviewer | First-tier review with build check and convention audit | Comments only, never approves or merges |
| PR Responder | Addresses review feedback, fixes code | Never mentions AI |
| Spec Conformance | Gate check against CODE-CONVENTIONS.md and FOLDER-STRUCTURE.md | Read-only, PASS/FAIL per rule per file |
| Branch Guardian | Manages branch lifecycle before/after fixer dispatch | Runs before and after every fixer agent |
| Pre-Merge Gate | Verifies all pipeline stages before merge | Read-only, MERGE-READY or BLOCKED verdict |
| Research Applicator | Diffs code against research findings post-implementation | Read-only, APPLIED/MISSED per recommendation |
| Overseer | Monitors agent team performance, produces performance reports | Read-only, dispatched post-cycle |
| Ticket Reviewer | Reviews tickets for conflicts, sizing, and scope before dispatch | Read-only, splits/merges/rescopes |

### Pipeline

```
Audit → Consolidate → Ticket Review → Conflict Detection → Branch Setup → Execute → Review → Respond → Gate Check → Pre-Merge Gate → Merge
```

Step 1: Audit — dispatch parallel codebase-auditor agents, each assigned a concern area (architecture, quality, safety, performance, coverage). They return structured findings.

Step 2: Consolidate — orchestrator groups findings into ISSUES.md with raw findings (F-XX by severity), tickets (TICKET-XXX with scope, files, acceptance criteria, conflicts), and an execution plan with wave ordering based on file overlap and dependencies. **Ticket scoping rule: no two tickets in the same wave may modify the same file.** If multiple findings target the same file, they must be grouped into a single ticket or placed in sequential waves. The orchestrator must build a file-to-ticket matrix and verify zero overlap within each wave before finalizing the execution plan.

Step 2.5: Ticket review — dispatch ticket-reviewer agent against all tickets in the wave. It checks file overlap, ticket sizing (splits oversized tickets), merge candidates, scope validation (vague → explicit files), and dependency ordering. The orchestrator applies its recommendations to ISSUES.md before proceeding. No tickets dispatch until the reviewer returns READY for every ticket in the wave.

Step 3: Conflict detection — dispatch branch-guardian agent in Phase 0 (pre-wave) mode. It reads the ticket file lists, builds the overlap matrix, checks open PRs for file conflicts, and outputs a serialization order. If overlap is found within a wave, the orchestrator must re-scope tickets (merge overlapping tickets or move one to a later wave) before proceeding.

Step 3.5: Branch Setup — dispatch branch-guardian agent in Phase 1 (pre-dispatch) mode before each fixer. It cleans stale worktrees/locks, verifies base branch, checks for open PR file conflicts, creates the ticket branch, and confirms checkout. Must complete before the fixer starts. If a file-lock conflict is found, dispatch is BLOCKED.

Step 4: Execute — dispatch codebase-fixer agents sequentially, one per ticket. Each works on a separate branch (do not use worktree isolation — agents need Bash access which worktrees block). Wave ordering is respected. Each agent creates a branch, implements the fix, runs build, commits, and creates a PR. After each fixer completes, dispatch branch-guardian again to validate commits and reset for the next agent. Test one agent first before dispatching the full batch to verify permissions work.

Step 5: Review — dispatch pr-reviewer agents, one per PR. Each checks out the branch, runs the build, reviews against CODE-CONVENTIONS.md and FOLDER-STRUCTURE.md, and posts a comment. Never approves or merges.

Step 6: Respond — dispatch pr-responder agents for PRs with review feedback. Each reads the comments, fixes the code, amends the commit, force-pushes, and comments confirming changes. If a review item requires a UI change, /frontend-design or ui-ux-pro-max must be consulted first.

Step 7: Gate check — dispatch spec-conformance agents to verify all files in the diff conform to CODE-CONVENTIONS.md. PASS/FAIL per rule per file. Any FAIL blocks merge.

Step 7.5: Pre-Merge Gate — dispatch pre-merge-gate agent for each PR. It checks 5 gates (build green, review completed, feedback addressed, spec conformance passed, tests exist). All gates must PASS for a MERGE-READY verdict. BLOCKED PRs cannot be merged until the blocking condition is resolved. This step is NOT optional — no PR merges without a MERGE-READY verdict, even if the orchestrator believes it is trivial.

Step 8: Merge — orchestrator cherry-picks or merges PRs in wave order with build gates between waves. Close PRs with references to merged commits. Only PRs with MERGE-READY verdict from pre-merge-gate can be merged.

### Dispatch Log

The orchestrator maintains an append-only dispatch log at `.planning/dispatch-log.md` during every cycle. This log is the overseer's primary data source for benchmarking pipeline completeness.

**Format — one line per event:**

```
| Timestamp | Ticket | Agent | Event | Notes |
|-----------|--------|-------|-------|-------|
| 2026-04-04 14:32 | T-066 | codebase-fixer | dispatched | |
| 2026-04-04 14:45 | T-066 | codebase-fixer | completed | PR #50 |
| 2026-04-04 14:46 | T-066 | pr-reviewer | dispatched | PR #50 |
| 2026-04-04 14:50 | T-066 | pr-reviewer | completed | 2 issues found |
| 2026-04-04 14:51 | T-066 | spec-conformance | skipped | reason: time constraint |
| 2026-04-04 14:52 | T-066 | pre-merge-gate | skipped | reason: not yet created |
| 2026-04-04 14:53 | T-066 | — | merged | PR #50 → main |
```

**Rules:**
- Every agent dispatch gets a `dispatched` entry. Every completion gets a `completed` entry.
- If a pipeline step is intentionally skipped, log it as `skipped` with a reason.
- If an agent fails (timeout, permissions, wrong branch), log as `failed` with details.
- The overseer diffs this log against the expected pipeline (Steps 2.5 through 8) to flag missing steps.
- The log is per-cycle. Start a new file for each wave: `.planning/dispatch-log-wave-N.md`.

**Expected steps per ticket (minimum):**

```
ticket-reviewer → branch-guardian (setup) → codebase-fixer → branch-guardian (validate) → pr-reviewer → spec-conformance → pre-merge-gate → merge
```

Any ticket missing a step in the log is flagged by the overseer as a pipeline gap.

### ISSUES.md Format

Raw findings organized by severity (CRITICAL, HIGH, MEDIUM, LOW), each with finding ID, files, problem, and fix. Tickets with type (blocking/non-blocking), severity, findings references, files affected, conflict tracking, branch name, scope, and acceptance criteria. Execution plan with wave ordering and dependency graph.

### Wave Ordering

Blocking tickets go first (Wave 1). Non-blocking tickets run in parallel (Wave 2). Tickets that depend on Wave 2 completions go in Wave 3. Codebase-wide sweeps (import ordering, comment cleanup) go last (Wave 4).

Within a wave, tickets that share modified files get serialization notes. The orchestrator manages merge order to avoid conflicts.

### PR Conventions

Titles use T-XXX: description format. Comments are plain text only — no markdown formatting, no bold, no styled bullets. No Co-Authored-By lines in commits. No AI mention anywhere.

### Rules (learned the hard way)

1. Establish all conventions before the audit starts. Never add rules mid-execution — it makes every in-flight PR non-compliant.
2. Do not use worktree isolation for agents that need Bash. Use mode: "auto" without isolation: "worktree".
3. Test one agent before dispatching the full batch to verify permissions work.
4. The orchestrator orchestrates. It does not do the agents' work. If something needs fixing, dispatch an agent.
5. Never merge without review. Review gate is non-negotiable.
6. Follow the discuss → research → approve → implement → verify pipeline for every code change, including refactors.
7. Clean up stale worktrees before dispatching new agents (old worktrees hold branch locks).
8. Every PR must include tests for the changes. Code-only PRs are not mergeable. Test-only PRs (backfilling coverage) are fine standalone.
9. Dispatch agents sequentially, not in parallel. Parallel agents sharing a working directory corrupt each other's branches (leaked commits, git lock files, wrong-branch commits). One agent at a time.
10. Never merge a PR before its review agent has reported back. Merging before review defeats the pipeline.

### What Agents Must Read

Every agent reads these files before starting:
- docs/CODE-CONVENTIONS.md — all code rules
- docs/FOLDER-STRUCTURE.md — file layout, three-tier architecture, import ordering, 3+ subcomponents → own folder rule

Reviewer agents must specifically check FOLDER-STRUCTURE.md compliance — the overnight build shipped folder violations because reviewers only checked CODE-CONVENTIONS.md.

Audit agents also read ISSUES.md to avoid reporting already-tracked issues. Fixer agents read their assigned ticket from ISSUES.md.
