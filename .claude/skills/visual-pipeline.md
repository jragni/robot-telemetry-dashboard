---
name: visual-pipeline
description: Enforces the 5-step visual work pipeline (discuss, research, approve, implement, verify) for any .tsx visual change. MUST be invoked before touching visual components.
---

# Visual Pipeline

Mandatory 5-step pipeline for ALL visual `.tsx` changes. No step can be skipped. Each step must produce evidence before proceeding to the next.

## When This Applies

Any edit to a `.tsx` file that changes what the user sees on screen. This includes:
- New components
- Layout changes (spacing, grid, flex)
- Color, typography, or styling changes
- Adding/removing visual elements
- Responsive behavior changes
- Animation or transition changes

## Exemptions

These changes do NOT require this pipeline:
- Refactors that don't change visual output (import reordering, type moves, renaming)
- Docstring/comment additions
- Test files (`.test.tsx`, `.test.ts`)
- Type files (`.types.ts`), constant files (`.constants.ts`), helper files (`.helpers.ts`)
- shadcn/ui files in `src/components/ui/` (never hand-edit)
- Pure logic changes inside hooks (no JSX changes)

## Step 1: Discuss

Present approaches and trade-offs to the user BEFORE writing any code.

**What to present:**
- What the change will look like (layout, interaction, states)
- 2-3 approach options with pros/cons
- Edge cases identified (empty state, error state, loading, responsive)
- Which existing components or patterns can be reused

**Evidence gate:** The user must see the discussion in the conversation. If you haven't presented options to the user, you have not completed this step.

**Do NOT proceed to Step 2 until you have presented the discussion.**

## Step 2: Research

Query design tools BEFORE proposing a final solution. Do NOT propose from your own knowledge then validate — tools first, then recommendations.

**Required queries:**
- `ui-ux-pro-max` — design intelligence (layout patterns, component styles, palettes, accessibility)
- `context7` — library docs for any shadcn/Tailwind/React APIs you'll use

**Evidence gate:** Include the actual research findings in your response. Quote specific recommendations from the tools. If you cannot show research output, you have not completed this step.

**Do NOT proceed to Step 3 until research findings are presented to the user.**

## Step 3: Approve

Get explicit user approval informed by the research findings.

**Valid approval signals:** "go ahead", "approved", "yes", "do it", "looks good", or equivalent affirmative.

**NOT valid:** Silence, moving on without response, "interesting", questions (answer them and wait for approval).

**Evidence gate:** The user's explicit approval message exists in the conversation.

**Do NOT proceed to Step 4 until the user has explicitly approved.**

## Step 4: Implement

Write the code, applying research findings from Step 2.

**Before writing:**
- Invoke `/frontend-design` for aesthetic guidance (anti-AI-slop, distinctive execution)
- Review the Pre-Write Checklist from CLAUDE.md
- Review CODE-CONVENTIONS.md and FOLDER-STRUCTURE.md

**While writing:**
- Apply specific recommendations from Step 2 research (spacing values, component choices, a11y patterns)
- Follow design system tokens from DESIGN-SYSTEM.md
- Use shadcn components where applicable

**Evidence gate:** The code must reflect specific recommendations from Step 2. If the research said "use gap-3" and the code uses gap-2, this step is not complete. The research-applicator agent can verify this post-implementation.

## Step 5: Verify

View rendered output before claiming the work is done. "It compiles" is NOT verification.

**Required screenshots:**
- Desktop: 1280x800 viewport via Playwright MCP
- Mobile: 375x812 viewport via Playwright MCP
- Save to `.playwright-mcp/screenshots/`

**What to check in screenshots:**
- Does it match the approved design from Step 3?
- Do colors, spacing, typography match the design system?
- Does it look correct in both dark and light themes?
- Is the responsive behavior correct?

**Evidence gate:** Screenshots have been taken, reviewed, and show correct rendering. If screenshots reveal issues, fix them and re-screenshot before claiming done.

## Process Violations

If you find yourself writing visual code without having completed Steps 1-3:
1. STOP immediately
2. Revert or stash your changes
3. Go back to Step 1
4. Work through the pipeline in order

The PreToolUse hook will remind you. Do not rationalize skipping steps with thoughts like:
- "This is just a small change" — small changes still need the pipeline
- "I already know how to do this" — the pipeline ensures user alignment, not just technical correctness
- "The user is waiting" — the user would rather wait than review work they didn't approve
- "I'll verify after" — verification without prior approval means rework if the user disagrees
