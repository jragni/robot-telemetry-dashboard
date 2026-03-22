#!/usr/bin/env bash
# Pre-commit hook: validates ALL GSD gates are enabled in config.json.
# Install: cp scripts/validate-gates.sh .git/hooks/pre-commit

CONFIG=".planning/config.json"

if [ ! -f "$CONFIG" ]; then
  echo "⚠ $CONFIG not found — skipping gate validation"
  exit 0
fi

DISABLED=$(python3 -c "
import json, sys
with open('$CONFIG') as f:
    gates = json.load(f).get('gates', {})
disabled = [k for k, v in gates.items() if v is not True]
if disabled:
    print('FAIL: These gates are disabled: ' + ', '.join(disabled))
    sys.exit(1)
" 2>&1)

if [ $? -ne 0 ]; then
  echo "🚫 Gate integrity check failed"
  echo "$DISABLED"
  echo ""
  echo "All gates in $CONFIG must be set to true."
  echo "If you need to disable a gate, discuss with the team first."
  exit 1
fi
