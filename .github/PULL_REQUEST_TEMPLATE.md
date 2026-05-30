<!--
Robot Telemetry Dashboard PR template.
Subject must follow: T-XXX: <verb phrase> (per CLAUDE.md commit/PR convention).
Target branch for feature/fix PRs: dev. Never main or uat directly.
See: docs/PR-REVIEW.md for the antagonistic review process and dispatch matrix.
-->

## Summary

<!--
3-6 bullets. Reader should understand WHAT shipped + WHY without opening another section.
- What changed (one line per discrete change)
- Why this PR exists (the problem or goal)
- User-facing impact (none / bug fix / new behavior / dev workflow)
- Anything reviewers should focus on first
-->

-

## Ticket(s)

<!-- ISSUES.md ticket IDs (e.g., T-104, T-151). Link section anchors when useful. -->

-

## Acceptance criteria met

<!-- Copy the acceptance criteria from the ticket. Check each. -->

- [ ]
- [ ]

## Verification output

<details>
<summary><code>npm run lint</code></summary>

```
<!-- paste output -->
```

</details>

<details>
<summary><code>npx tsc -b</code></summary>

```
<!-- paste output -->
```

</details>

<details>
<summary><code>npx vitest run</code></summary>

```
<!-- paste output: total test count, pass/fail -->
```

</details>

<details>
<summary><code>npx playwright test --config=playwright.smoke.config.ts</code></summary>

```
<!-- paste output. If smoke skipped (docs-only PR), state why. -->
```

</details>

## Antagonistic review

<!--
Dispatch matrix is in docs/PR-REVIEW.md. Fill counts after reviewer agents return.
Every BLOCK must be Resolved or explicitly Overridden (with reason + owner) before merge.
Required on feature -> dev PRs. dev -> uat and uat -> main promotions can SKIP the matrix when each constituent feature -> dev PR already ran it (the diff is non-empty by definition for any promotion PR — what gates the skip is whether every commit in the diff was already reviewed under the matrix).
-->

- Reviewers invoked: <!-- e.g., voltagent-qa-sec:code-reviewer, voltagent-qa-sec:performance-engineer -->
- BLOCK findings: <!-- count — Resolved in <sha> | Overridden by <handle>: <reason> -->
- WARN findings: <!-- count — Resolved in <sha> | Accepted: <reason> -->
- NIT findings: <!-- count — Resolved | Accepted -->

## Files touched (exclusive)

<!-- Exhaustive list of files modified. Used by branch-guardian / ticket-reviewer for collision detection. -->

-

## Breaking changes / migration notes

<!-- Schema changes, store shape changes, public API surface changes. "None" if not applicable. -->

-

## Manual test steps

<!-- Steps a reviewer runs to verify locally. "Covered by Playwright suite e2e/.../X.spec.ts" is acceptable. -->

1.

## Out-of-scope follow-ups

<!-- Things noticed but intentionally not fixed in this PR. Link to ISSUES.md or open a follow-up ticket. -->

-

## Pre-merge checklist

- [ ] Base branch = `dev` (never `main` or `uat` directly)
- [ ] PR title is `T-XXX: <description>` (no AI mention, no Co-Authored-By)
- [ ] `## Summary` populated (3-6 bullets)
- [ ] All four verification commands ran (or each skip is documented above)
- [ ] Antagonistic review BLOCK count = 0 (or explicitly overridden in the body)
- [ ] Tests added/updated for behavior changes (per CLAUDE.md tests-required rule)
- [ ] No new files outside the FOLDER-STRUCTURE.md conventions
- [ ] No hardcoded oklch/hex/rgb in `.tsx` (validate:tokens passes)
- [ ] No deep barrel-bypass imports
- [ ] Will be merged with `--merge`, NEVER `--squash`
