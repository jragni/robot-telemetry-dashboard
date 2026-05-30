# PR Review Process — Antagonistic Review

Adopted 2026-05-29 (re-issued after the three-tier branch strategy in PR #120). Replaces the older single-`pr-reviewer` flow. Modeled on OnlyOn's antagonistic review pattern.

## Severities

Every reviewer comment MUST be classified as one of:

| Tier      | Definition                                                                                                                                                                      | Disposition                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **BLOCK** | Bug, correctness regression, security issue, type-system erosion, perf cliff, or violation of CODE-CONVENTIONS.md / FOLDER-STRUCTURE.md. The PR cannot ship with it open.       | Must be resolved or explicitly overridden by the owner in the PR body. |
| **WARN**  | Meaningful smell or risk that should be fixed soon — e.g., missing test for a behavior change, unclear naming, marginal abstraction leak, eslint-disable without justification. | Resolve, or document acceptance in the PR body.                        |
| **NIT**   | Style, comment, minor refactor that the author can take or leave.                                                                                                               | Optional.                                                              |

Comment bodies are plain text — no markdown formatting (project convention). Every comment cites `file:line`, quotes the code, and proposes a concrete fix without implementing it.

## When the review runs in the three-tier flow

| Promotion         | Review depth                                                                                                                                         | Notes                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `feature/* → dev` | Full antagonistic review per the matrix below. BLOCKs must be resolved before merge.                                                                 | Per-PR review. Most reviews happen here. |
| `dev → uat`       | Owner review + targeted re-review only if dev accumulated risky surfaces. The matrix is not re-run on every dev→uat — UAT is a human review surface. | Use for batches of dev work.             |
| `uat → main`      | No new findings expected. Owner verifies UAT sign-off; smoke + UAT regression spec passes.                                                           | Promotion only.                          |
| `hotfix/* → dev`  | Abbreviated review (one reviewer agent + owner).                                                                                                     | Hotfix protocol in CLAUDE.md.            |

## Reviewer matrix (dispatch by change surface)

Dispatch the reviewer team in parallel after the `feature/* → dev` PR opens. Pick from this matrix based on what the diff actually touches:

| Surface                                           | Reviewer agent(s)                                                                                                                        |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| All feature → dev PRs (baseline)                  | `voltagent-qa-sec:code-reviewer`                                                                                                         |
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

1. **Open the PR** with `--base dev`. Body MUST include the `## Antagonistic review` block (see `.github/PULL_REQUEST_TEMPLATE.md`).
2. **Dispatch the matrix.** Author dispatches the relevant agents in parallel (background). Each posts inline comments on its findings and returns a structured summary.
3. **Aggregate.** Update the PR body with: reviewers invoked, BLOCK count, WARN count, NIT count.
4. **Resolve.** For each BLOCK: fix and reply on the comment with the fixing commit SHA. For each WARN: fix or reply with acceptance rationale. NITs are optional.
5. **Merge gate (feature → dev).** BLOCK count = 0 (or explicitly overridden in the PR body). Owner sign-off + pre-merge checklist complete. Always `--merge`, never `--squash`.

Bypassing the reviewer matrix requires an explicit "skip reviewer matrix" note in the PR body with a reason — used only for trivial doc-only / chore PRs.

## Comment conventions

- Plain text only — no `**bold**`, no fenced code blocks (inline backticks ok for symbols).
- Lead with the severity in brackets: `[BLOCK]`, `[WARN]`, `[NIT]`.
- File and line are carried by the inline-comment anchor; the body restates them only when context is ambiguous (multi-line).
- One issue per comment. Don't bundle.
- Propose a concrete fix; do not implement.
- Reviewer agents NEVER approve and NEVER merge.

## Resolution comments (from PR author)

When replying to a finding, use one of:

- `Resolved in <sha>.` (the fixing commit)
- `Accepted (no fix). Reason: <one line>.`
- `Override (BLOCK only). Reason: <one line>. Owner: <handle>.`

These three replies are the only acceptable closures. Anything else stays open.

## Document the matrix in the PR body

The PR template ships an `## Antagonistic review` section. Fill it like:

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
