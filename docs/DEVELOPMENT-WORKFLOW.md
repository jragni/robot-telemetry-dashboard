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

For codebase audits, bulk refactors, and housekeeping tickets, use the 5-role agent team defined in .claude/agents/.

### Roles

| Role | Agent File | What it does | Constraints |
|------|-----------|-------------|-------------|
| Codebase Auditor | codebase-auditor.md | Scans codebase for issues in a specific concern area | Read-only, structured findings output |
| Codebase Fixer | codebase-fixer.md | Implements one ticket per worktree, creates PR | Must pass build, follow CODE-CONVENTIONS.md |
| PR Reviewer | pr-reviewer.md | First-tier review with build check and convention audit | Comments only, never approves or merges |
| PR Responder | pr-responder.md | Addresses review feedback, fixes code | Never mentions AI, /frontend-design for UI changes |
| Spec Conformance | spec-conformance.md | Gate check against CODE-CONVENTIONS.md and FOLDER-STRUCTURE.md | Read-only, PASS/FAIL per rule per file |

### Pipeline

```
Audit → Consolidate → Conflict Detection → Execute → Review → Respond → Gate Check → Merge
```

Step 1: Audit — dispatch parallel codebase-auditor agents, each assigned a concern area (architecture, quality, safety, performance, coverage). They return structured findings.

Step 2: Consolidate — orchestrator groups findings into ISSUES.md with raw findings (F-XX by severity), tickets (TICKET-XXX with scope, files, acceptance criteria, conflicts), and an execution plan with wave ordering based on file overlap and dependencies.

Step 3: Conflict detection — before dispatching fixers, an agent analyzes ticket file lists and flags which tickets share files. Tickets with overlapping files get serialized (one completes before the next starts). Tickets with no overlap run in parallel. This prevents rebase conflicts from parallel PRs touching the same files.

Step 4: Execute — dispatch parallel codebase-fixer agents, one per ticket. Each works on a separate branch (do not use worktree isolation — agents need Bash access which worktrees block). Wave ordering is respected (sequential between waves, parallel within waves). Each agent creates a branch, implements the fix, runs build, commits, and creates a PR. Test one agent first before dispatching the full batch to verify permissions work.

Step 5: Review — dispatch pr-reviewer agents, one per PR. Each checks out the branch, runs the build, reviews against CODE-CONVENTIONS.md and FOLDER-STRUCTURE.md, and posts a comment. Never approves or merges.

Step 6: Respond — dispatch pr-responder agents for PRs with review feedback. Each reads the comments, fixes the code, amends the commit, force-pushes, and comments confirming changes. If a review item requires a UI change, /frontend-design or ui-ux-pro-max must be consulted first.

Step 7: Gate check — dispatch spec-conformance agents to verify all files in the diff conform to CODE-CONVENTIONS.md. PASS/FAIL per rule per file. Any FAIL blocks merge.

Step 8: Merge — orchestrator cherry-picks or merges PRs in wave order with build gates between waves. Close PRs with references to merged commits.

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

### What Agents Must Read

Every agent reads these files before starting:
- CLAUDE.md — process rules, architecture, references
- docs/CODE-CONVENTIONS.md — all code rules
- docs/FOLDER-STRUCTURE.md — file layout, three-tier architecture, import ordering

Audit agents also read ISSUES.md to avoid reporting already-tracked issues. Fixer agents read their assigned ticket from ISSUES.md.
