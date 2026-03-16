# Correction Tracking System — Design Spec

**Date:** 2026-03-16
**Status:** Approved (Rev 3 — all review issues resolved)
**Scope:** Self-correcting feedback loop for Claude Code — detects corrections, logs them with full conversation context, preemptively surfaces past mistakes before repeating them, and auto-escalates recurring patterns.

---

## 1. Problem Statement

Claude makes mistakes during development sessions. The user corrects them, but those corrections are lost between sessions. The same mistakes recur, forcing the user to re-correct. There is no systematic way to:

- Capture corrections as they happen
- Store them with enough context to be useful later
- Surface relevant past mistakes before Claude repeats them
- Escalate recurring patterns into permanent rules

## 2. Design Goals

- **Automatic detection** — Claude recognizes when it's being corrected without the user invoking a command
- **Zero-friction capture** — background agent logs everything asynchronously, never blocks the conversation
- **Preemptive recall** — before taking action, Claude checks past corrections and flags relevant ones
- **Self-improving** — recurring corrections auto-escalate from project log → memory → CLAUDE.md hard rules
- **Scope-aware** — user decides if a correction is local (project), global (all projects), or one-time
- **Fuzzy by design** — detection is probabilistic, not deterministic. The system tolerates false positives via user escape hatches and gates Tier 3 escalation behind user approval.

## 3. Correction Categories

| ID  | Category             | Signal Patterns                                                                              |
| --- | -------------------- | -------------------------------------------------------------------------------------------- |
| A   | Approach correction  | "no, do it this way", "don't do X", "instead", "I'd prefer", "that's not what I meant"       |
| B   | Implementation error | "that's broken", "doesn't work", "there's a bug", "that fails", "wrong output"               |
| C   | Missing context      | "you forgot about", "what about X", "you missed", "you didn't consider"                      |
| D   | Repeated mistake     | "I told you before", "again?", "we discussed this", "I already said"                         |
| E   | Convention violation | "that's not how we do it", "check the conventions", "wrong pattern", "look at how X does it" |

**Implicit corrections:** User rewrites/replaces something Claude just produced, or user's follow-up contradicts Claude's approach without explicitly saying "you're wrong."

**Non-corrections to ignore:** Normal iteration ("can you also add..."), scope changes ("actually let's do Y instead of X" when X wasn't wrong), and questions ("why did you choose X?" without indicating X is wrong).

**False positive escape hatch:** If Claude misidentifies something as a correction, the user can say "that wasn't a correction" or "not a correction" and the **main context** deletes the correction file, INDEX.md row, and any memory system entry created by Global scope. The background agent may have already exited by the time the user triggers the escape hatch, so cleanup is always the main context's responsibility. The detection section in CLAUDE.md must include this escape pattern.

## 4. Detection Mechanism

CLAUDE.md receives a "Correction Detection" section with the signal patterns above. When Claude detects a correction:

1. Claude acknowledges the correction inline and fixes the issue immediately
2. Claude constructs the correction context (see Section 10 for required inputs) by extracting the relevant conversation arc from the current session — the user's original request, Claude's response that was wrong, and the user's correction
3. Claude spawns a **background correction-logger agent** with the extracted context
4. Main conversation continues uninterrupted
5. When the agent completes, Claude asks a brief scope question (see Section 8) — but only at a natural pause point. If the user is mid-thought or has moved on significantly, defer the prompt to the next natural break or append it to the next response.

Detection is instruction-based — CLAUDE.md tells Claude to self-monitor for these patterns. No hooks or external tooling required.

**Detection is fuzzy.** Claude will sometimes miscategorize normal iteration as a correction or miss implicit corrections. This is acceptable because:

- False positives are caught by the scope prompt (user selects "Once" to discard)
- False negatives are caught by the user saying "that was a correction" or "remember this mistake"
- Tier 3 escalation (the highest-impact action) requires user approval

## 5. Correction Entry Structure

Each correction is a markdown file in `.claude/corrections/`.

**File naming:** `YYYY-MM-DD-{short-slug}-{seq}.md` where `{seq}` is a sequence number (01, 02, 03) to handle multiple corrections on the same day with similar slugs. First correction of a slug on a given day uses `01`.

**Template:**

```markdown
---
category: convention-violation
severity: medium
tags: [exports, component-rules]
occurrences: 1
tier: 1
date: 2026-03-16
scope: local
related_files: [src/components/layout/Header.tsx]
---

## What Was Asked

> User's original prompt/request (verbatim or summarized)

## What Claude Did Wrong

Description of the specific mistake Claude made.

## The Correction

> User's correction (verbatim quote)

## Root Cause

Why Claude made this mistake — what it failed to check, misunderstood, or forgot.

## Lesson

The general principle or rule that prevents this mistake.

## Prevention Rule

The specific, actionable check Claude should perform before taking similar actions in the future.
```

**Field definitions:**

- `category` — one of: `approach`, `implementation-error`, `missing-context`, `repeated-mistake`, `convention-violation`
- `severity` — assigned by background agent using these criteria:
  - `low` — style nit, cosmetic issue, no functional impact (e.g., wrong variable name casing)
  - `medium` — wrong approach or missed convention, code works but isn't right (e.g., default export instead of named)
  - `high` — broken code, test failure, or logic error (e.g., missing null check that causes crash)
  - `critical` — data loss risk, security issue, or production-breaking change (e.g., dropped database table)
- `tags` — generated by the background agent from a controlled vocabulary (see Section 5a)
- `occurrences` — total count of this correction pattern (incremented on similar matches). Integer, starts at 1.
- `tier` — current escalation tier: `1` (project), `2` (memory), `3` (claude-md). Replaces the ambiguous `promoted` boolean.
- `scope` — `local` (project only), `global` (all projects), `once` (not saved — entry deleted after scope selection)
- `related_files` — files involved in the mistake, for file-path-proximity matching

### 5a. Tag Vocabulary

Tags are drawn from a controlled vocabulary to ensure consistent matching. The background agent selects from these categories:

**Domain tags:** `components`, `hooks`, `stores`, `services`, `types`, `tests`, `routing`, `styles`, `config`, `utilities`, `views`

**Action tags:** `exports`, `imports`, `naming`, `file-structure`, `error-handling`, `state-management`, `rxjs`, `zustand`, `testing`, `mocking`, `rendering`, `performance`, `accessibility`

**Pattern tags:** `architecture`, `conventions`, `typescript`, `react-patterns`, `async`, `subscriptions`, `cleanup`, `validation`

The agent selects 2-4 tags per correction. If the correction doesn't fit existing tags, the agent may introduce a new tag but must add it to the vocabulary list in INDEX.md's header.

## 6. Corrections Index

`.claude/corrections/INDEX.md` — a quick-scan summary maintained by the background agent:

```markdown
# Corrections Index

Last updated: 2026-03-16
Total corrections: 3
Active Tier 3 rules: 0

## Custom Tags

<!-- Tags not in the default vocabulary, added by the background agent -->

## Entries

| Date       | File                   | Category             | Tags                | Severity | Occurrences | Tier |
| ---------- | ---------------------- | -------------------- | ------------------- | -------- | ----------- | ---- |
| 2026-03-16 | used-default-export-01 | convention-violation | exports, components | medium   | 2           | 2    |
| 2026-03-17 | forgot-types-file-01   | convention-violation | types, components   | medium   | 1           | 1    |
```

This file enables fast pre-checks without reading every correction file. The main context scans this one table.

**Concurrency:** The **background agent** appends new rows to the table (append-only — never rewrites the full file). If two agents run concurrently, each appends independently. Duplicate detection happens at read time during pre-check, not at write time. This avoids race conditions on INDEX.md. Note: the **main context** may perform row deletions from INDEX.md (for escape hatch and Once scope cleanup) — the append-only constraint applies only to background agents.

## 7. Pre-Check System

Before Claude takes action at key decision points, it scans corrections for relevant past mistakes.

### When Pre-Check Runs

- Before writing or editing code
- Before choosing an implementation approach
- Before starting a new GSD phase

### How It Works

1. Read `.claude/corrections/INDEX.md`
2. Match current task context against corrections using the matching rules below
3. If relevant corrections found, surface the **top 3 most relevant** inline before proceeding (maximum 3 to control context pressure):

```
⚠ Past correction (2026-03-16): Used default export in component file.
  Lesson: Always use `export function Name`, never `export default`.
  Prevention: Check CLAUDE.md Component Rules before writing exports.

Proceeding with this in mind.
```

4. If a correction has `occurrences >= 2`, elevated visibility — Claude must explicitly state how it's avoiding the mistake this time

### Matching Rules

A correction matches the current task if **any** of these conditions are true (OR logic):

1. **Tag overlap:** at least 1 tag matches the current task's domain (e.g., task involves writing a component → matches corrections tagged `components`)
2. **Category relevance:** task type maps to a category (e.g., writing code → scan `implementation-error` and `convention-violation`)
3. **File-path proximity:** a file in `related_files` is the same file or in the same directory as the file being edited

When multiple corrections match, rank by: `occurrences` (descending) → `severity` (critical > high > medium > low) → `date` (most recent first). Surface top 3.

### Performance

Pre-check scans INDEX.md only (one file, table format). Full correction files are read only for the top 3 matched entries. This keeps pre-check lightweight. At 50+ corrections, the INDEX.md table is still small enough to scan in a single read.

## 8. Scope Prompt

After the background agent completes, the main context asks at the next natural pause:

```
📝 Correction logged: {one-line summary}
Scope? (L)ocal to this project / (G)lobal across all projects / (O)nce (don't save)
```

| Scope      | Storage                                                    | Pre-Check Visibility       | Escalation                                                                                |
| ---------- | ---------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------- |
| Local (L)  | `.claude/corrections/` only                                | This project only          | Promotes to memory at Tier 2 (2 total occurrences)                                        |
| Global (G) | `.claude/corrections/` + immediately to memory system      | All projects via `/recall` | Escalates to CLAUDE.md at Tier 3 (3 total occurrences) — but still requires user approval |
| Once (O)   | Deleted — background agent's file and INDEX.md row removed | None                       | None                                                                                      |

**Scope = Once cleanup:** When the user selects Once, the main context deletes the correction file and removes the INDEX.md row that the background agent wrote. If the correction had Global scope pre-applied (immediate memory copy), the memory system entry is also deleted. This is a synchronous cleanup in the main context, not a second background agent.

**Global scope and escalation thresholds:** A Global correction starts at Tier 1 with an immediate copy to the memory system. It still requires 2 total occurrences for the correction file to be marked `tier: 2` and 3 total occurrences for Tier 3. The Global scope means it's _visible_ globally from day one, but escalation thresholds are the same.

**Defaults:**

- If user doesn't respond (continues with other work) → defaults to **Local**
- Convention violations (E) → auto-suggest **Local**
- Repeated mistakes (D) → auto-suggest **Global**

## 9. Escalation & Promotion

Three tiers of correction persistence, auto-managed by the background agent (Tiers 1-2) and user-gated (Tier 3):

### Tier 1: Project Correction (Default)

- Lives in `.claude/corrections/{date}-{slug}-{seq}.md`
- `tier: 1` in frontmatter
- Surfaced via pre-check when tags match current task
- Every correction starts here

### Tier 2: Memory Promotion (2 total occurrences)

When the background agent writes a new correction and finds an existing one matching **same category AND at least 1 shared tag**:

- Increments `occurrences` on the existing entry
- Sets `tier: 2` on both entries
- Promotes the pattern to `~/.claude/projects/{project-slug}/memory/feedback_{slug}.md` (path resolved dynamically from the current working directory)
- Updates MEMORY.md index with the new feedback entry
- Now survives across sessions and is discoverable via `/recall`

### Tier 3: CLAUDE.md Hard Rule (3 total occurrences — USER APPROVAL REQUIRED)

When a correction reaches 3 total occurrences, the background agent does NOT auto-write to CLAUDE.md. Instead:

1. The background agent prepares the proposed rule text
2. The main context presents the rule to the user for approval:

```
🔺 Correction pattern hit 3 occurrences: {summary}
Proposed CLAUDE.md rule: NEVER {mistake}. ALWAYS {correct behavior}.
Add to Learned Rules? (Y)es / (N)o / (E)dit
```

3. If approved: appended to `## Learned Rules` section in CLAUDE.md
4. Format: `- NEVER {mistake}. ALWAYS {correct behavior}. (Source: {n} corrections, last-triggered: {date})`
   - The `last-triggered` date is updated by the main context each time a pre-check surfaces this rule and Claude explicitly references it while working. This tracks actual usage, not just promotion date.
5. If edited: user provides revised wording, then it's appended
6. If rejected: correction stays at Tier 2, `occurrences` continues to increment. Re-prompt for Tier 3 every 5 additional occurrences after rejection (e.g., rejected at 3, re-prompted at 8, 13, etc.) in case the user's stance has changed.

**CLAUDE.md size budget:** Maximum **15 Learned Rules** in CLAUDE.md. When the 16th rule would be added, the oldest rule (by last-triggered date) is archived to `.claude/corrections/archived-rules.md` and removed from CLAUDE.md.

### Demotion

At **session start**, CLAUDE.md instructs Claude to audit the Learned Rules section:

- Check each rule's `last:` date
- If a rule hasn't been triggered in 30+ days, flag it:

```
📋 Learned Rule review: "{rule}" hasn't triggered in 30+ days. Keep or archive? (K/A)
```

This runs once per session, not via background agent (background agents are ephemeral and can't run on a schedule).

### Escalation Example

```
March 16: Used default export         → Tier 1, occurrences: 1 (logged in .claude/corrections/)
March 18: Used default export again   → Tier 2, occurrences: 2 (promoted to memory, both entries updated)
March 20: Used default export AGAIN   → occurrences: 3, user prompted to approve Tier 3 rule
  User approves → Tier 3 (hard rule in CLAUDE.md Learned Rules)
```

## 10. Background Agent Design

**Agent type:** `general-purpose` with `run_in_background: true`

### Inputs

Constructed by the main context at detection time. The main context extracts the relevant conversation excerpt and passes it as serialized text — the background agent does not have access to the parent's conversation history.

```
- category: one of the 5 types (approach | implementation-error | missing-context | repeated-mistake | convention-violation)
- user_prompt: what the user originally asked (extracted verbatim from conversation)
- claude_mistake: what Claude did wrong (summarized by main context)
- user_correction: the user's correction (extracted verbatim from conversation)
- relevant_files: files involved in the mistake
- conversation_context: the conversation excerpt showing the full arc (prompt → response → correction)
- project_corrections_path: absolute path to .claude/corrections/
- project_memory_path: absolute path to the project's memory directory (resolved dynamically)
- claude_md_path: absolute path to CLAUDE.md
```

### Responsibilities (in order)

1. Generate 2-4 tags from the controlled vocabulary (Section 5a) based on the correction context
2. Assign severity using the criteria in Section 5
3. Write the correction entry to `.claude/corrections/`
4. Scan existing corrections for similar patterns (**same category AND at least 1 shared tag**)
5. If similar found → increment `occurrences` on existing entry, set `tier: 2` on both
6. If occurrences reaches 2 → promote to memory system (Tier 2): write feedback file + update MEMORY.md
7. If occurrences reaches 3 → prepare proposed Tier 3 rule text (do NOT write to CLAUDE.md — return the proposal for user approval)
8. Append new row to `.claude/corrections/INDEX.md` (append-only, never rewrite)

### Agent Does NOT

- Interrupt the main conversation
- Ask the user questions (scope prompt and Tier 3 approval are handled by main context)
- Modify any source code
- Write to CLAUDE.md (Tier 3 requires user approval via main context)
- Read files outside `.claude/`, memory system, and CLAUDE.md

## 11. File System Layout

```
.claude/
├── corrections/
│   ├── INDEX.md                              # Quick-scan table + custom tag registry
│   ├── archived-rules.md                     # Demoted Tier 3 rules
│   ├── 2026-03-16-used-default-export-01.md  # Individual correction entries
│   ├── 2026-03-17-forgot-types-file-01.md
│   └── ...
├── references/                               # Existing reference files
│   ├── project-context.md
│   ├── workflow-preferences.md
│   ├── adding-new-code.md
│   └── build-history.md
└── settings.local.json

CLAUDE.md                                     # Gets new sections:
                                              #   - Correction Detection (signal patterns + escape hatch)
                                              #   - Pre-Check Protocol (INDEX.md scan rules)
                                              #   - Learned Rules (Tier 3, max 15, user-approved)

~/.claude/projects/{project-slug}/memory/
├── feedback_*.md                             # Tier 2 promotions land here
├── MEMORY.md                                 # Index updated with promoted corrections
└── memories/                                 # Existing memories
```

**Git policy:** `.claude/corrections/` should be added to `.gitignore`. Corrections are personal workflow artifacts, not project source. If the user wants to share corrections with a team, they can opt-in by removing the gitignore entry.

## 12. CLAUDE.md Additions

Three new sections added to the project CLAUDE.md:

### Correction Detection Section

Lists the 5 category signal patterns. Instructs Claude to:

1. Fix the issue immediately
2. Extract the conversation arc (user prompt, Claude's mistake, user correction)
3. Spawn background correction-logger agent with extracted context
4. Ask scope question at next natural pause when agent completes
5. Recognize "not a correction" escape hatch — delete the entry if triggered

### Pre-Check Protocol Section

Instructs Claude to scan `.claude/corrections/INDEX.md` before:

- Writing or editing code
- Choosing an implementation approach
- Starting a new GSD phase

Rules: OR-logic matching (tag overlap OR category relevance OR file-path proximity), top 3 results max, ranked by occurrences → severity → recency. Elevated visibility for corrections with occurrences >= 2.

### Learned Rules Section

Initially empty. Auto-populated by user-approved Tier 3 escalations. Maximum 15 rules. Audited at session start for 30-day demotion.

```markdown
## Learned Rules

<!-- Auto-populated by correction tracking system. User-approved only. Max 15 rules. -->
<!-- Audited at session start — rules untriggered for 30+ days flagged for review. -->
```

## 13. Success Criteria

- Corrections are detected and logged without user invoking a command
- Full conversation arc (prompt → mistake → correction → lesson) is captured
- Pre-check surfaces relevant past mistakes (max 3) before Claude repeats them
- Recurring corrections auto-escalate through Tiers 1-2 automatically
- Tier 3 (CLAUDE.md rules) requires user approval — never auto-written
- Background agent never blocks or slows the main conversation
- Scope prompt is unobtrusive (one-line, defaults to Local, deferred to natural pause)
- False positives handled via "not a correction" escape hatch and Once scope
- System works within existing Claude Code infrastructure (no external tools)
- CLAUDE.md stays under size budget (max 15 Learned Rules)
- Corrections directory is gitignored by default
