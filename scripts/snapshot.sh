#!/bin/bash
# Captures a pre-cycle baseline snapshot for observability.
# Usage: bash scripts/snapshot.sh <branch-or-label>
# Output: .planning/snapshots/pre-<label>.md

LABEL="${1:-$(git branch --show-current)}"
LABEL=$(echo "$LABEL" | tr '/' '-')
OUTPUT=".planning/snapshots/pre-${LABEL}.md"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

mkdir -p .planning/snapshots

# Capture metrics
TEST_RESULT=$(npx vitest run --reporter=json 2>/dev/null | tail -1)
TEST_COUNT=$(echo "$TEST_RESULT" | grep -o '"numTotalTests":[0-9]*' | cut -d: -f2)
TEST_PASSED=$(echo "$TEST_RESULT" | grep -o '"numPassedTests":[0-9]*' | cut -d: -f2)
TEST_FAILED=$(echo "$TEST_RESULT" | grep -o '"numFailedTests":[0-9]*' | cut -d: -f2)
TEST_FILES=$(echo "$TEST_RESULT" | grep -o '"numTotalTestSuites":[0-9]*' | cut -d: -f2)

LINT_ERRORS=$(npx eslint src/ --format json 2>/dev/null | grep -o '"errorCount":[0-9]*' | cut -d: -f2 | paste -sd+ - | bc 2>/dev/null || echo "?")

BUILD_STATUS="pass"
npm run build --silent 2>/dev/null || BUILD_STATUS="fail"

BRANCH=$(git branch --show-current)
COMMIT=$(git rev-parse --short HEAD)
FILE_COUNT=$(find src -name "*.ts" -o -name "*.tsx" | wc -l | tr -d ' ')

cat > "$OUTPUT" << EOF
# Pre-Cycle Snapshot: ${LABEL}

- **Timestamp:** ${TIMESTAMP}
- **Branch:** ${BRANCH}
- **Commit:** ${COMMIT}

## Metrics

| Metric | Value |
|--------|-------|
| Test files | ${TEST_FILES:-?} |
| Tests total | ${TEST_COUNT:-?} |
| Tests passed | ${TEST_PASSED:-?} |
| Tests failed | ${TEST_FAILED:-0} |
| Lint errors | ${LINT_ERRORS} |
| Build status | ${BUILD_STATUS} |
| Source files | ${FILE_COUNT} |
EOF

echo "Snapshot saved: ${OUTPUT}"
