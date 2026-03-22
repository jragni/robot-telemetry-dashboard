# V4 Phase Metrics

## Summary

| Metric | Target | Actual |
|--------|--------|--------|
| First-pass rate | ≥80% | — |
| Avg rework cycles | ≤1 per phase | — |
| Avg human checkpoint time | <120s | — |
| False positive rate | <10% | — |

## Per-Phase Log

| Phase | Type | First Pass? | Rework Cycles | Gate Catch | Human Time (s) | Agents | Duration | Notes |
|-------|------|-------------|---------------|------------|----------------|--------|----------|-------|
| 1 | logic | | | | | | | |
| 2 | visual | | | | | | | |
| 3 | visual | | | | | | | |
| 4 | integration | | | | | | | |
| 5 | logic | | | | | | | |
| 6 | visual | | | | | | | |
| 7 | visual | | | | | | | |
| 8 | integration | | | | | | | |
| 9 | visual | | | | | | | |
| 10 | visual | | | | | | | |
| 11 | visual | | | | | | | |
| 12 | integration | | | | | | | |

## Gate Catch Types

- `lint` — ESLint error or warning
- `tsc` — TypeScript compilation error
- `vitest` — Unit/integration test failure
- `visual-assertion` — Playwright visual gate assertion failure
- `build` — Vite build failure
- `human` — Human caught issue during screenshot review

## Column Definitions

- **First Pass?** — Did the phase pass quality gate on first attempt? (yes/no)
- **Rework Cycles** — Number of fix-and-retry cycles (0 = first pass)
- **Gate Catch** — Which automated gate caught the first failure (if any)
- **Human Time (s)** — Seconds spent on human checkpoint review
- **Agents** — Number of subagents dispatched during phase
- **Duration** — Wall-clock time from phase start to human approval
