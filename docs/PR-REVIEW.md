# PR Review Process — Antagonistic Review

Adopted 2026-05-29 (re-issued after the three-tier branch strategy in PR #120). Augments the older single-`pr-reviewer` flow (`.claude/agents/pr-reviewer.md` + `pr-responder.md`) with a multi-agent matrix. Modeled on OnlyOn's antagonistic review pattern.

## Severities

Every reviewer comment MUST be classified as one of:

| Tier      | Definition                                                                                                                                                                      | Disposition                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **BLOCK** | Bug, correctness regression, security issue, type-system erosion, perf cliff, or violation of CODE-CONVENTIONS.md / FOLDER-STRUCTURE.md. The PR cannot ship with it open.       | Must be resolved or explicitly overridden by the owner in the PR body. |
| **WARN**  | Meaningful smell or risk that should be fixed soon — e.g., missing test for a behavior change, unclear naming, marginal abstraction leak, eslint-disable without justification. | Resolve, or document acceptance in the PR body.                        |
| **NIT**   | Style, comment, minor refactor that the author can take or leave.                                                                                                               | Optional.                                                              |

Comment bodies are plain text — no markdown formatting (project convention). Every comment cites `file:line`, quotes the code, and proposes a concrete fix without implementing it.

## When the review runs (GitHub Flow)

Every PR targets `main`. The PR is the only review surface — there is no `dev` or `uat` branch.

| PR                 | Review depth                                                                                          | Notes                         |
| ------------------ | ----------------------------------------------------------------------------------------------------- | ----------------------------- |
| `feature/* → main` | Full antagonistic review per the matrix below. BLOCKs resolved before merge; `quality-gate` CI green. | Most reviews happen here.     |
| `fix/* → main`     | Same as feature.                                                                                      | Scope the matrix to the diff. |
| `hotfix/* → main`  | Abbreviated review (one reviewer agent + owner). Self-merge allowed once `quality-gate` is green.     | Hotfix protocol in CLAUDE.md. |
| `chore/* (docs)`   | May skip the matrix with a "skip reviewer matrix" note in the PR body + reason.                       | Doc-only / bookkeeping.       |

## Reviewer matrix (dispatch by change surface)

Dispatch the reviewer team in parallel after the `feature/* → main` PR opens. Pick from this matrix based on what the diff actually touches:

| Surface                                           | Reviewer agent(s)                                                                                                                        |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| All feature → main PRs (baseline)                 | `voltagent-qa-sec:code-reviewer`                                                                                                         |
| Hot-path hooks / per-message work                 | `voltagent-qa-sec:performance-engineer`                                                                                                  |
| Connection, transport, retry, async               | `pr-review-toolkit:silent-failure-hunter`                                                                                                |
| Schemas, types, type design                       | `pr-review-toolkit:type-design-analyzer`                                                                                                 |
| New tests or behavior change with tests           | `pr-review-toolkit:pr-test-analyzer`                                                                                                     |
| New abstractions / system design                  | `voltagent-qa-sec:architect-reviewer`                                                                                                    |
| Auth, credentials, surfaces visible to user input | `voltagent-qa-sec:security-auditor`                                                                                                      |
| Comments or large docstrings added                | `pr-review-toolkit:comment-analyzer`                                                                                                     |
| Frontend `.tsx` aesthetic changes                 | Visual pipeline (`ui-ux-pro-max` + `/frontend-design` + Playwright) — see CLAUDE.md. Reviewer agents do not replace visual verification. |

A PR can (and often will) attract multiple reviewers. Total finding counts in the PR body should sum across all reviewers.

## Workflow

1. **Open the PR** with `--base main`. Body MUST include the `## Antagonistic review` block (see `.github/PULL_REQUEST_TEMPLATE.md`).
2. **Dispatch the matrix.** Author dispatches the relevant agents in parallel (background). Each posts inline comments on its findings and returns a structured summary.
3. **Aggregate.** Update the PR body with: reviewers invoked, BLOCK count, WARN count, NIT count.
4. **Resolve.** For each BLOCK: fix and reply on the comment with the fixing commit SHA. For each WARN: fix or reply with acceptance rationale. NITs are optional.
5. **Merge gate (feature → main).** BLOCK count = 0 (or explicitly overridden in the PR body), `quality-gate` CI green, owner sign-off. Always `--merge --delete-branch`, never `--squash`.

Bypassing the reviewer matrix requires an explicit "skip reviewer matrix" note in the PR body with a reason — used only for trivial doc-only / chore PRs.

## Comment conventions

- Plain text only — no `**bold**`, no fenced code blocks (inline backticks ok for symbols).
- Lead with the severity in brackets: `[BLOCK]`, `[WARN]`, `[NIT]`.
- File and line are carried by the inline-comment anchor; the body restates them only when context is ambiguous (multi-line).
- One issue per comment. Don't bundle.
- Propose a concrete fix; do not implement.
- Reviewer agents NEVER approve and NEVER merge.

## Resolution comments (from PR author)

BLOCK and WARN findings MUST receive one of these three closure replies before merge:

- `Resolved in <sha>.` (the fixing commit)
- `Accepted (no fix). Reason: <one line>.` (WARN only — BLOCK accepted-without-fix uses Override below)
- `Override (BLOCK only). Reason: <one line>. Owner: <handle>.`

NITs do not require a closure reply — they can be left open or closed without one. Anything other than the three closures above leaves a BLOCK or WARN open.

## Document the matrix in the PR body

The PR template ships an `## Antagonistic review` section. The PR body uses markdown (this is the only place markdown is permitted in the review flow — inline review comments stay plain text per the conventions above). Fill the section like:

```
## Antagonistic review
- Reviewers invoked: voltagent-qa-sec:code-reviewer, voltagent-qa-sec:performance-engineer
- BLOCK findings: 0
- WARN findings: 2 — both Resolved in abc1234
- NIT findings: 3 — accepted (no fix)
```

If any BLOCK is overridden, cite the override reason and owner inline.

## Known limitations

- The voltagent code reviewer can stall at the 600s watchdog on large diffs. Mitigation: dispatch surface-scoped reviewers in parallel rather than one monolithic review.
- Inline comments are tied to lines that exist in the diff; cross-file calibration findings should be posted as a top-level PR comment.
