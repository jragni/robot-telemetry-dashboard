#!/bin/bash
# Validate folder/file conventions per CLAUDE.md
# Currently warnings — will be promoted to pre-commit blocks once stable.

ERRORS=0

echo "=== Structure Validation ==="

# Check for inline constants in .tsx files (Record<, readonly arrays, config objects)
echo ""
echo "Checking for inline constants in .tsx files..."
for file in $(find src -name "*.tsx" -not -path "*/ui/*"); do
  # Look for const ... Record< or const ... : readonly or large const objects
  if grep -n "^const [A-Z].*Record<\|^const [A-Z].*: readonly\|^const [A-Z].*\[\]" "$file" 2>/dev/null | grep -v "import" > /dev/null; then
    echo "  WARNING: $file has inline constants — extract to .constants.ts"
    ERRORS=$((ERRORS + 1))
  fi
done

# Check for JSX comments describing children (potential subcomponent extraction)
echo ""
echo "Checking for JSX comments that should be subcomponents..."
for file in $(find src -name "*.tsx" -not -path "*/ui/*"); do
  matches=$(grep -n "{/\*.*\*/}" "$file" 2>/dev/null | grep -vi "noop\|TODO\|eslint\|prettier" | head -5)
  if [ -n "$matches" ]; then
    echo "  WARNING: $file has JSX comments — consider extracting to named subcomponents:"
    echo "$matches" | sed 's/^/    /'
    ERRORS=$((ERRORS + 1))
  fi
done

# Check for hardcoded colors
echo ""
echo "Checking for hardcoded colors in .tsx files..."
for file in $(find src -name "*.tsx" -not -path "*/ui/*"); do
  if grep -n "oklch\|#[0-9a-fA-F]\{3,\}\|rgba\?(" "$file" 2>/dev/null | grep -v "getComputedStyle\|getPropertyValue\|// \|/\*" > /dev/null; then
    echo "  WARNING: $file has hardcoded colors — use var() tokens or Tailwind utilities"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "✓ All structure checks passed"
else
  echo "⚠ $ERRORS warnings found"
fi

exit 0  # Warnings only — change to exit $ERRORS when promoting to hard blocks
