---
title: Panel System UX Redesign — Cursor Feedback + Floating Command Bar
date: 2026-03-18
relevance: high
tags:
  [
    ux,
    panels,
    react-grid-layout,
    cursor,
    toolbar,
    floating-action-button,
    defense-contractor,
  ]
phase: 14-02
---

# Panel System UX Redesign Spec

## Problem

1. Resize handles are invisible on dark theme (react-grid-layout defaults use black borders/SVG on charcoal background)
2. Edit mode has no visual indicator — users don't know panels are interactive
3. PanelToolbar horizontal bar wastes vertical viewport space and feels generic

## Design Decisions

### 1. Resize Handle Restyling (ISS-004)

Override react-grid-layout's default handle CSS for dark theme:

- `.react-resizable-handle::after` border color → `--primary` (electric blue)
- `.react-resizable-handle` SVG background → blue-tinted version or remove entirely (the ::after border is sufficient)
- Handles already have correct cursor CSS (se-resize, ew-resize, etc.) — just need visibility
- Drag handle in PanelFrame already has `cursor-grab active:cursor-grabbing` ✓

### 2. Edit Mode Visual Treatment

When edit mode is active:

- Panels get `ring-1 ring-primary/30` outline — subtle but visible
- Faint dashed border on panels (signals "this is movable")
- Subtle background tint `bg-primary/5` on the grid container (signals "you're in edit mode")
- Resize handles fade in on hover (already built, just invisible)

### 3. Floating Command Bar (ISS-005)

Replace PanelToolbar horizontal bar with floating command bar:

**Collapsed state:**

- Position: `fixed bottom-6 right-6`
- Appearance: rounded button, `bg-primary`, icon-only (⊞ grid icon)
- Size: 40x40px
- Always visible (not just in edit mode)

**Expanded state (on click):**

- Expands upward with staggered animation (150ms delay between items)
- Shows 3 action buttons vertically:
  - ✓ Done (only when in edit mode — replaces the toggle)
  - - Add Panel
  - ↺ Reset Layout
- Each button: pill-shaped, `bg-card border border-border`, icon + label
- Click outside or "Done" collapses back

**Edit mode toggle:**

- First click on FAB → enters edit mode + expands menu
- "Done" button → exits edit mode + collapses menu
- If already in edit mode and FAB is collapsed → clicking expands without toggling mode

**Defense-contractor feel:**

- Tactical command overlay aesthetic
- Electric blue accent on FAB
- Muted card background on expanded items
- Monospace labels (font-mono text-[10px] uppercase tracking-widest)

### 4. Edit Mode Indicator on FAB

When edit mode is active:

- FAB gets a pulsing ring animation: `ring-2 ring-primary/40 animate-pulse`
- Or: small dot indicator on the FAB corner

## Files to Modify

- `src/style.css` — override react-grid-layout handle styles
- `src/features/panels/components/PanelGrid.tsx` — add edit mode visual treatment to container
- `src/features/panels/components/PanelFrame.tsx` — add edit mode ring to panel cards
- `src/features/panels/components/PanelToolbar.tsx` — rewrite as FloatingCommandBar
- `src/views/DashboardView.tsx` — update toolbar import
- `src/views/MapView.tsx` — update toolbar import

## What NOT to Change

- PanelGrid layout logic (already working)
- AddPanelDialog (reuse as-is)
- Panel content/widgets (untouched)
- Mobile behavior (toolbar already hidden on mobile)
