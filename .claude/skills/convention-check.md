---
name: convention-check
description: Pre-commit convention scanner. Checks import ordering, object key alphabetization, styled comments, inline types, and other mechanical rules against changed files.
---

# Convention Check

Pre-commit scanner that catches mechanical convention violations before they reach review. Run this before committing to avoid the violations that reappear in every audit.

## How to Run

1. Get changed files:
   - Staged: `git diff --cached --name-only`
   - All changes: `git diff --name-only HEAD`
   - Specific files: pass file paths directly
2. Filter to `.ts` and `.tsx` files only (skip `.json`, `.md`, `.css`, config files)
3. Run each check below against each file
4. Report all violations in PASS/FAIL format

## Checks

### 1. Import Ordering

Three groups separated by blank lines:

**Group 1 — 3rd party:** React first, then hooks (`use*`), then libraries, then `type` imports.
**Group 2 — Aliased (`@/`):** hooks > 3rd party components (lucide-react, etc.) > `@/` components > types.
**Group 3 — Relative (`./`, `../`):** hooks > components > types.

Within each sub-group, alphabetize by import path.

**How to check:**
- Read the import block (all consecutive `import` lines at the top of the file)
- Verify blank lines separate the 3 groups
- Verify React (`from 'react'`) is the very first import
- Verify alphabetization within sub-groups
- Flag any `../../` or deeper relative import (should use `@/` alias instead)

### 2. Object Key Alphabetization

All object literal keys must be in alphabetical order.

**How to check:**
- Find object literals with 2+ keys on separate lines
- Verify key names are alphabetically ordered
- Exclude: function call arguments (positional), array elements, switch cases, JSX props (those are checked separately)

### 3. Styled Comment Removal

No decorative section separator comments.

**How to check:**
- Grep for patterns: `// ──`, `// ━━`, `// ══`, `// ——`, `// ==== ` (4+ equals with spaces)
- Any match is a FAIL

### 4. Inline Type Detection

Types must not be defined inline in `.tsx` files. They belong in `.types.ts`.

**How to check (`.tsx` files only):**
- Grep for `^(export )?(type|interface) \w+` at the start of a line
- Exclude: `type` imports (`import type`), type annotations on variables, generic type parameters
- Any type/interface definition in a `.tsx` file is a FAIL

### 5. Destructured Props Alphabetization

Destructured function parameters must have properties in alphabetical order.

**How to check:**
- Find function signatures with destructured params: `function Name({ a, b, c }` or `const Name = ({ a, b, c })`
- Verify property names are alphabetized
- Ignore rest params (`...rest`) — they always go last

### 6. No React Context

No `createContext` or `useContext` usage. Zustand only.

**How to check:**
- Grep for `createContext` or `useContext` (as import or call)
- Any match is a FAIL (unless in a shadcn `ui/` file — those are exempt)

### 7. Missing JSDoc on Exports

Exported functions in `.tsx` and `.ts` files must have JSDoc with `@description` and `@param` tags — unless the function is short (under ~5 lines) and self-descriptive.

**How to check:**
- Find `export (default )?function` or `export const \w+ =` patterns in `.ts` and `.tsx` files
- Check that the line immediately above (or within 2 lines above) contains `/**`
- If JSDoc exists, verify it has `@description` and `@param` for each parameter
- Skip functions under ~5 lines with obvious names and signatures
- Missing or incomplete JSDoc on a non-trivial exported function is a FAIL

### 8. No Hardcoded Colors

No hardcoded OKLCH/hex/RGB values in `.tsx` files.

**How to check (`.tsx` files only):**
- Grep for `oklch(`, `#[0-9a-fA-F]{3,8}`, `rgb(`, `rgba(`, `hsl(`
- Exclude: comments, string literals used for non-color purposes
- Any hardcoded color value is a FAIL — use Tailwind utility classes

### 9. Barrel Bypass Detection

Imports must go through barrel files (index.ts), not directly to the file inside the folder.

**How to check:**
- Grep for import paths matching `FolderName/FolderName` pattern (e.g., `from './components/SystemStatusPanel/SystemStatusPanel'`)
- The correct import is `from './components/SystemStatusPanel'` (resolves through index.ts)
- Any `FolderName/FolderName` import where an index.ts barrel exists in that folder is a FAIL

### 10. Folder Completeness

Components over 100 lines or with canvas/draw logic should have their own folder with co-located files.

**How to check:**
- If a `.tsx` file is over 100 lines and is a flat file (not in its own folder), flag it
- If a component imports constants from a parent `constants.ts` (e.g., `from '../constants'`), those constants should be co-located in the component's folder
- If a component folder exists but is missing `.types.ts` when the component has props, flag it

### 11. Function Length

Functions over 50 lines are candidates for extraction into helpers.

**How to check:**
- Count lines between function opening `{` and closing `}`
- Flag any function over 50 lines as WARN (not FAIL — use judgment for canvas draw functions that are inherently sequential)

## Output Format

```
PASS: src/features/fleet/components/RobotCard/RobotCard.tsx (11/11 checks)

FAIL: src/hooks/useImuSubscription.ts (8/11 checks)
  [FAIL] Import ordering: React import not first (line 3)
  [FAIL] Object keys: imuMessageSchema keys not alphabetized (line 14)
  [FAIL] Barrel bypass: importing from useControlPublisher/useControlPublisher (line 5)
  [PASS] No styled comments
  [PASS] No inline types
  [PASS] Props alphabetized
  [PASS] No React Context
  [PASS] JSDoc present
  [PASS] No hardcoded colors
  [PASS] Folder completeness
  [PASS] Function length

SUMMARY: 1 PASS, 1 FAIL (3 violations in 1 file)
```

## Integration Points

- Run before `git commit` — fix all FAILs before committing
- The codebase-fixer agent's self-audit checklist should invoke this
- The spec-conformance agent checks the same rules post-PR — this catches them earlier
- `npm run validate:tokens` already checks hardcoded colors in `.tsx` — this is a superset
