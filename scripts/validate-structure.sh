#!/bin/bash
# Validate folder/file conventions per CLAUDE.md
# Currently warnings — will be promoted to pre-commit blocks once stable.

ERRORS=0

echo "=== Structure Validation ==="

# Check for inline constants in .tsx files (Record<, readonly arrays, config objects)
echo ""
echo "Checking for inline constants in .tsx files..."
for file in $(find src -name "*.tsx" -not -path "*/ui/*" -not -path "*DevView*"); do
  if grep -n "^const [A-Z].*Record<\|^const [A-Z].*: readonly\|^const [A-Z].*\[\]" "$file" 2>/dev/null | grep -v "import" > /dev/null; then
    echo "  WARNING: $file has inline constants — extract to .constants.ts"
    ERRORS=$((ERRORS + 1))
  fi
done

# Check for hardcoded colors (excluding shadow vars, URL anchors, and comments)
echo ""
echo "Checking for hardcoded colors in .tsx files..."
for file in $(find src -name "*.tsx" -not -path "*/ui/*"); do
  if grep -n "oklch\|rgba\?(" "$file" 2>/dev/null | grep -v "getComputedStyle\|getPropertyValue\|var(--\|// \|/\*\|href=" > /dev/null; then
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
