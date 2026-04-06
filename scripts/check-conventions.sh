#!/bin/bash
# Pre-commit convention checks for staged .ts/.tsx files.
# Runs via lint-staged. Receives file paths as arguments.
# Exits non-zero if any violation is found.

ERRORS=0

for file in "$@"; do
  # Skip test files, type files, and non-existent files
  if [[ "$file" == *.test.* ]] || [[ "$file" == *.types.* ]] || [[ ! -f "$file" ]]; then
    continue
  fi

  # 1. Inline types in .tsx component files
  if [[ "$file" == *.tsx ]]; then
    INLINE_TYPES=$(grep -n '^\(export \)\?interface \|^\(export \)\?type [A-Z]' "$file" 2>/dev/null)
    if [[ -n "$INLINE_TYPES" ]]; then
      echo "CONVENTION: inline type/interface in .tsx file — move to .types.ts"
      echo "  $file"
      echo "$INLINE_TYPES" | sed 's/^/    /'
      ERRORS=$((ERRORS + 1))
    fi
  fi

  # 2. Inline types in .ts files (hooks, helpers, etc. — not .types.ts, not constants, not index, not utils/)
  if [[ "$file" == *.ts ]] && [[ "$file" != *.tsx ]] && [[ "$file" != *.types.ts ]] && [[ "$file" != */constants.ts ]] && [[ "$file" != */index.ts ]] && [[ "$file" != */schemas.ts ]] && [[ "$file" != src/utils/* ]]; then
    INLINE_TYPES=$(grep -n '^\(export \)\?interface \|^\(export \)\?type [A-Z]' "$file" 2>/dev/null)
    if [[ -n "$INLINE_TYPES" ]]; then
      echo "CONVENTION: inline type/interface in .ts file — move to .types.ts"
      echo "  $file"
      echo "$INLINE_TYPES" | sed 's/^/    /'
      ERRORS=$((ERRORS + 1))
    fi
  fi

  # 3. @param used on React components (should be @prop)
  if [[ "$file" == *.tsx ]]; then
    PARAM_ON_COMPONENT=$(grep -n '@param' "$file" 2>/dev/null)
    if [[ -n "$PARAM_ON_COMPONENT" ]]; then
      echo "CONVENTION: @param in .tsx component — use @prop for component props"
      echo "  $file"
      echo "$PARAM_ON_COMPONENT" | sed 's/^/    /'
      ERRORS=$((ERRORS + 1))
    fi
  fi

  # 4. Deep hook imports — must use @/hooks barrel
  DEEP_HOOKS=$(grep -n "from '@/hooks/[a-zA-Z]" "$file" 2>/dev/null | grep -v "from '@/hooks'")
  if [[ -n "$DEEP_HOOKS" ]]; then
    echo "CONVENTION: deep hook import — use barrel import from '@/hooks'"
    echo "  $file"
    echo "$DEEP_HOOKS" | sed 's/^/    /'
    ERRORS=$((ERRORS + 1))
  fi

  # 5. Duplicate imports from same module
  DUPE_MODULES=$(grep -o "from '[^']*'" "$file" 2>/dev/null | sort | uniq -d)
  if [[ -n "$DUPE_MODULES" ]]; then
    echo "CONVENTION: duplicate imports from same module — consolidate into single import"
    echo "  $file"
    echo "$DUPE_MODULES" | sed 's/^/    /'
    ERRORS=$((ERRORS + 1))
  fi

  # 6. Missing JSDoc on exported functions (renumbered from 4)
  if [[ "$file" == *.ts ]] || [[ "$file" == *.tsx ]]; then
    # Find exported functions without a preceding JSDoc block
    # Look for 'export function' or 'export async function' not preceded by '*/'
    MISSING_JSDOC=$(awk '
      /[[:space:]]*\*\// { has_jsdoc = 1; next }
      /^export (async )?function / {
        if (!has_jsdoc) print NR": "$0
        has_jsdoc = 0
        next
      }
      { has_jsdoc = 0 }
    ' "$file" 2>/dev/null)
    if [[ -n "$MISSING_JSDOC" ]]; then
      echo "CONVENTION: exported function missing JSDoc"
      echo "  $file"
      echo "$MISSING_JSDOC" | sed 's/^/    /'
      ERRORS=$((ERRORS + 1))
    fi
  fi
done

if [[ $ERRORS -gt 0 ]]; then
  echo ""
  echo "Found $ERRORS convention violation(s). Fix before committing."
  exit 1
fi
