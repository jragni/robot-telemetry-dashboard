# PR Review Process — Antagonistic Review

Adopted 2026-05-29. Replaces the older single-`pr-reviewer` flow. Modeled on OnlyOn's antagonistic review pattern.

## Severities

Every reviewer comment MUST be classified as one of:

| Tier      | Definition                                                                                                                                                                      | Disposition                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **BLOCK** | Bug, correctness regression, security issue, type-system erosion, perf cliff, or violation of CODE-CONVENTIONS.md / FOLDER-STRUCTURE.md. The PR cannot ship with it open.       | Must be resolved or explicitly overridden by the owner in the PR body. |
| **WARN**  | Meaningful smell or risk that should be fixed soon — e.g., missing test for a behavior change, unclear naming, marginal abstraction leak, eslint-disable without justification. | Resolve, or document acceptance in PR body.                            |
| **NIT**   | Style, comment, minor refactor that the author can take or leave.                                                                                                               | Optional.                                                              |

Comment bodies are plain text only — no markdown formatting (per repo convention). Every comment cites `file:line`, quotes the code, and proposes a concrete fix without implementing it.

## Reviewer matrix (dispatch by change surface)

Dispatch the reviewer team in parallel after the PR opens. Pick from this matrix based on what the diff actually touches:

| Surface                                           | Reviewer agent(s)                                                                                                                        |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| All PRs (baseline)                                | `voltagent-qa-sec:code-reviewer`                                                                                                         |
| Hot-path hooks / per-message work                 | `voltagent-qa-sec:performance-engineer`                                                                                                  |
| Connection, transport, retry, async               | `pr-review-toolkit:silent-failure-hunter`                                                                                                |
| Schemas, types, type design                       | `pr-review-toolkit:type-design-analyzer`                                                                                                 |
| New tests or behavior change w/ tests             | `pr-review-toolkit:pr-test-analyzer`                                                                                                     |
| New abstractions / system design                  | `voltagent-qa-sec:architect-reviewer`                                                                                                    |
| Auth, credentials, surfaces visible to user input | `voltagent-qa-sec:security-auditor`                                                                                                      |
| Comments or large docstrings added                | `pr-review-toolkit:comment-analyzer`                                                                                                     |
| Frontend `.tsx` aesthetic changes                 | Visual pipeline (`ui-ux-pro-max` + `/frontend-design` + Playwright) — see CLAUDE.md. Reviewer agents do not replace visual verification. |

A PR can (and often will) attract multiple reviewers. Total finding counts in the PR body should add across all reviewers.

## Workflow

1. **Open the PR.** Body MUST include the `## Antagonistic review` block (see `.github/PULL_REQUEST_TEMPLATE.md`).
2. **Dispatch the matrix.** Author or maintainer dispatches the relevant agents in parallel (background). Each posts inline comments on its findings and returns a structured summary.
3. **Aggregate.** Update the PR body with: reviewers invoked, BLOCK count, WARN count, NIT count.
4. **Resolve.** For each BLOCK: fix and reply on the comment with the fixing commit SHA. For each WARN: fix or reply with acceptance rationale. NITs are optional.
5. **Merge gate.** BLOCK count = 0 (or explicitly overridden in the PR body). Owner sign-off + pre-merge checklist complete.

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
