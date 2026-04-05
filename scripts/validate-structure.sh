#!/bin/bash
# Validate folder/file conventions per FOLDER-STRUCTURE.md
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

# Check for hardcoded colors (excluding shadow vars, URL anchors, canvas mocks, and comments)
echo ""
echo "Checking for hardcoded colors in .tsx files..."
for file in $(find src -name "*.tsx" -not -path "*/ui/*" -not -path "*/mocks/*"); do
  if grep -n "oklch\|rgba\?(" "$file" 2>/dev/null | grep -v "getComputedStyle\|getPropertyValue\|var(--\|// \|/\*\|href=" > /dev/null; then
    echo "  WARNING: $file has hardcoded colors — use var() tokens or Tailwind utilities"
    ERRORS=$((ERRORS + 1))
  fi
done

# Check for feature-prefixed files (e.g., fleet.helpers.ts, landing.constants.ts)
echo ""
echo "Checking for feature-prefixed file names..."
for dir in $(find src/features -mindepth 1 -maxdepth 1 -type d); do
  feature=$(basename "$dir")
  for file in $(find "$dir" -maxdepth 1 -name "${feature}.*" -type f 2>/dev/null); do
    echo "  ERROR: $file — use $(basename "$file" | sed "s/${feature}\.//")" instead of feature-prefixed name
    ERRORS=$((ERRORS + 1))
  done
done

# Check for components at feature root that should be in components/
echo ""
echo "Checking for components at feature root (should be in components/)..."
for dir in $(find src/features -mindepth 1 -maxdepth 1 -type d); do
  feature=$(basename "$dir")
  for file in $(find "$dir" -maxdepth 1 -name "*.tsx" -type f 2>/dev/null); do
    fname=$(basename "$file")
    # Page components (FeatureOverview, FeaturePage, RobotWorkspace) are allowed at root
    # Skip if it matches *Overview.tsx, *Page.tsx, *Workspace.tsx
    if echo "$fname" | grep -qE "(Overview|Page|Workspace)\.tsx$"; then
      continue
    fi
    echo "  WARNING: $file — non-page component should be in $dir/components/"
    ERRORS=$((ERRORS + 1))
  done
done

# Check for canvas font sizes outside design system (12/14/20/36px only)
echo ""
echo "Checking canvas font sizes..."
for file in $(find src -name "*.tsx" -not -path "*/ui/*"); do
  if grep -n "ctx\.font.*=.*'[0-9]" "$file" 2>/dev/null | grep -v "12px\|14px\|20px\|36px" > /dev/null; then
    echo "  WARNING: $file has non-standard canvas font size — use 12/14/20/36px only"
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
