#!/bin/bash
# Generates a post-cycle scorecard by comparing current state to a snapshot.
# Usage: bash scripts/scorecard.sh <snapshot-file> <label>
# Output: .planning/scorecards/<label>.md

SNAPSHOT="${1:-.planning/snapshots/pre-main.md}"
LABEL="${2:-$(git branch --show-current)}"
LABEL=$(echo "$LABEL" | tr '/' '-')
OUTPUT=".planning/scorecards/${LABEL}.md"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

mkdir -p .planning/scorecards

if [[ ! -f "$SNAPSHOT" ]]; then
  echo "Error: snapshot file not found: $SNAPSHOT"
  exit 1
fi

# Extract baseline values from snapshot
BASELINE_TESTS=$(grep "Tests total" "$SNAPSHOT" | grep -o '[0-9]*' | head -1)
BASELINE_PASSED=$(grep "Tests passed" "$SNAPSHOT" | grep -o '[0-9]*' | head -1)
BASELINE_FAILED=$(grep "Tests failed" "$SNAPSHOT" | grep -o '[0-9]*' | head -1)
BASELINE_LINT=$(grep "Lint errors" "$SNAPSHOT" | grep -o '[0-9]*' | head -1)
BASELINE_FILES=$(grep "Source files" "$SNAPSHOT" | grep -o '[0-9]*' | head -1)
BASELINE_BUILD=$(grep "Build status" "$SNAPSHOT" | awk '{print $NF}')

# Capture current values
TEST_RESULT=$(npx vitest run --reporter=json 2>/dev/null | tail -1)
CURRENT_TESTS=$(echo "$TEST_RESULT" | grep -o '"numTotalTests":[0-9]*' | cut -d: -f2)
CURRENT_PASSED=$(echo "$TEST_RESULT" | grep -o '"numPassedTests":[0-9]*' | cut -d: -f2)
CURRENT_FAILED=$(echo "$TEST_RESULT" | grep -o '"numFailedTests":[0-9]*' | cut -d: -f2)

CURRENT_LINT=$(npx eslint src/ --format json 2>/dev/null | grep -o '"errorCount":[0-9]*' | cut -d: -f2 | paste -sd+ - | bc 2>/dev/null || echo "?")

CURRENT_BUILD="pass"
npm run build --silent 2>/dev/null || CURRENT_BUILD="fail"

CURRENT_FILES=$(find src -name "*.ts" -o -name "*.tsx" | wc -l | tr -d ' ')

# Calculate deltas
delta() {
  local base="${1:-0}"
  local current="${2:-0}"
  local diff=$((current - base))
  if [[ $diff -gt 0 ]]; then echo "+${diff}"
  elif [[ $diff -lt 0 ]]; then echo "${diff}"
  else echo "0"; fi
}

cat > "$OUTPUT" << EOF
# Post-Cycle Scorecard: ${LABEL}

- **Timestamp:** ${TIMESTAMP}
- **Baseline:** ${SNAPSHOT}

## Delta

| Metric | Baseline | Current | Delta |
|--------|----------|---------|-------|
| Tests total | ${BASELINE_TESTS:-?} | ${CURRENT_TESTS:-?} | $(delta "${BASELINE_TESTS}" "${CURRENT_TESTS}") |
| Tests passed | ${BASELINE_PASSED:-?} | ${CURRENT_PASSED:-?} | $(delta "${BASELINE_PASSED}" "${CURRENT_PASSED}") |
| Tests failed | ${BASELINE_FAILED:-0} | ${CURRENT_FAILED:-0} | $(delta "${BASELINE_FAILED}" "${CURRENT_FAILED}") |
| Lint errors | ${BASELINE_LINT:-?} | ${CURRENT_LINT:-?} | $(delta "${BASELINE_LINT}" "${CURRENT_LINT}") |
| Build status | ${BASELINE_BUILD} | ${CURRENT_BUILD} | — |
| Source files | ${BASELINE_FILES:-?} | ${CURRENT_FILES:-?} | $(delta "${BASELINE_FILES}" "${CURRENT_FILES}") |

## Review Findings

<!-- Manually append review round summaries here -->

## Process Failures

<!-- Manually append process failures here -->
EOF

echo "Scorecard saved: ${OUTPUT}"
