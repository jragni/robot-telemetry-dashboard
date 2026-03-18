# Phase 14: View Wiring - Context

**Gathered:** 2026-03-18
**Status:** Ready for re-planning (14-02 needs rewrite)

<vision>
## How This Should Work

The dashboard is a power-user tool. No modes, no toggles, no floating buttons. Panels are always editable — right-click for a context menu, drag from the header bar, resize from corner grips. It should feel like a desktop environment where you just grab things and move them.

**Normal use (monitoring):** Clean panels with no extra chrome. The header bar has the panel title and that's it. Corner resize grips are small and always visible (like a window). Nothing obstructs the panel content.

**Rearranging:** Grab the entire header bar to drag a panel. The cursor changes to `grab`/`grabbing`. Right-click anywhere for a shadcn dropdown menu with all options — Add Panel, Duplicate, Remove, Reset Layout. Panel-specific items are disabled when clicking empty space.

**Resizing:** All four corners have visible resize grips. Hover shows the correct directional cursor (nw-resize, ne-resize, etc). Drag to resize. The grid placeholder shows in electric blue during the drag.

Nothing moves by accident. The header bar is the drag zone (not the panel body). Resize requires grabbing a corner grip. Right-click is deliberate. Monitoring is the priority use case.

</vision>

<essential>
## What Must Be Nailed

- **Always editable, no mode toggle** — No edit mode, no FAB, no toolbar. Panels are always interactive via header drag + corner grips + right-click context menu.
- **Nothing moves by accident** — Can't drag from panel body. Only header bar and corner grips are interactive. Right-click for destructive actions (remove).
- **Visible corner grips on all four corners** — Small resize handles always visible, electric blue accent, correct directional cursors.
- **Drag from entire header bar** — The whole header is the grab zone with cursor: grab. Not just a small grip icon.
- **Right-click context menu everywhere** — shadcn DropdownMenu style. Right-click panel: Add Panel, Duplicate, Remove, Reset Layout. Right-click empty space: same menu but Duplicate/Remove disabled.
- **Electric blue accents** — Resize grips, drag placeholder, context menu hover highlights all use --primary.

</essential>

<boundaries>
## What's Out of Scope

- No floating action button (FAB) — removed entirely
- No edit mode toggle — panels are always editable
- No PanelToolbar horizontal bar — replaced by context menu
- No lock/unlock mechanism
- No keyboard shortcuts for panel management (future phase)
- No panel duplication logic yet (menu item can exist but can be disabled for now)

</boundaries>

<specifics>
## Specific Ideas

- Remove button (×): show on header hover only — cleaner look, less noise, prevents accidental removal. Fits defense-contractor "clean until interacted with" pattern.
- Context menu: clean shadcn DropdownMenu, not custom styled. Consistent with rest of UI.
- Resize grips: all 4 corners (not just bottom-right). react-grid-layout supports `resizeHandles={['nw', 'ne', 'sw', 'se']}` prop.
- Drag placeholder: electric blue with low opacity during panel move.
- Header bar: cursor changes to `grab` on hover, `grabbing` when dragging. The entire header div is the draggable handle (expand `.panel-drag-handle` selector to cover full header).

</specifics>

<notes>
## Additional Context

This is a significant pivot from the 14-02 plan which designed a floating command bar with edit mode toggle. The user's vision is more power-user oriented — always editable, context menu driven, no modes. The plan needs to be rewritten to match.

The current PanelToolbar.tsx and its references in DashboardView/MapView should be removed entirely. The FloatingCommandBar design from the spec should be discarded.

Key files that need changes:

- PanelGrid.tsx — remove editMode dependency for drag/resize, add resizeHandles prop
- PanelFrame.tsx — make header always draggable, show × on hover
- DataCard.tsx — expand drag handle to full header
- style.css — dark theme handle overrides (Task 1 from old plan still valid)
- New: PanelContextMenu.tsx — right-click context menu component
- Delete: PanelToolbar.tsx (replace with context menu)

</notes>

---

_Phase: 14-view-wiring_
_Context gathered: 2026-03-18_
