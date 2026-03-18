# Phase 14: View Wiring (Plan 02) - Research

**Researched:** 2026-03-18
**Domain:** react-grid-layout customization + shadcn context menu for panel UX
**Confidence:** HIGH

<research_summary>

## Summary

Researched how to implement always-editable panels with context menus, four-corner resize handles, and full-header dragging using react-grid-layout v2 and shadcn/ui.

Key finding: react-grid-layout already supports all needed features via props — `resizeHandles` accepts an array of corner positions (`['nw', 'ne', 'sw', 'se']`), `draggableHandle` is a CSS selector that can target the full header, and `isDraggable`/`isResizable` can be set to `true` permanently (no edit mode needed). The only new component needed is a shadcn ContextMenu wrapper — it's not currently installed but can be added via CLI.

**Primary recommendation:** Set `isDraggable={true}` and `isResizable={true}` permanently (remove editMode dependency), add `resizeHandles={['nw', 'ne', 'sw', 'se']}`, expand `.panel-drag-handle` to cover full header bar, install and wrap panels with shadcn ContextMenu.
</research_summary>

<standard_stack>

## Standard Stack

### Core (already installed)

| Library           | Version | Purpose                        | Status               |
| ----------------- | ------- | ------------------------------ | -------------------- |
| react-grid-layout | 2.2.2   | Grid layout with drag + resize | Installed            |
| react-resizable   | 3.1.3   | Resize handle rendering        | Installed (peer dep) |

### Needs Installation

| Library             | Install Command                      | Purpose                  |
| ------------------- | ------------------------------------ | ------------------------ |
| shadcn context-menu | `npx shadcn@latest add context-menu` | Right-click context menu |

**Note:** shadcn context-menu is built on Radix UI `@radix-ui/react-context-menu`. The `npx shadcn` command handles the Radix dependency automatically.
</standard_stack>

<architecture_patterns>

## Architecture Patterns

### Pattern 1: Always-On Drag + Resize (No Edit Mode)

Remove all `editMode` conditionals. Set grid props permanently:

```tsx
<Responsive
  isDraggable={true}
  isResizable={true}
  resizeHandles={['nw', 'ne', 'sw', 'se']}
  draggableHandle=".panel-drag-handle"
  // ... other props
>
```

The `draggableHandle` selector prevents accidental drags — only elements matching the CSS selector trigger drag. Expand it to cover the full header bar.

### Pattern 2: Four-Corner Resize Handles

react-grid-layout's `resizeHandles` prop accepts: `'s'`, `'w'`, `'e'`, `'n'`, `'sw'`, `'nw'`, `'se'`, `'ne'`

Default is `['se']` (bottom-right only). Setting `['nw', 'ne', 'sw', 'se']` enables all four corners.

Each handle gets a CSS class: `.react-resizable-handle-{axis}` with the correct cursor already applied:

- `nw-resize` for top-left
- `ne-resize` for top-right
- `sw-resize` for bottom-left
- `se-resize` for bottom-right

Handles are 20x20px absolutely positioned, with `opacity: 0` by default, fading in on `.react-grid-item:hover`. Override opacity to make them always visible.

### Pattern 3: Custom Resize Handle Component

react-grid-layout supports a `resizeHandle` prop for custom handle rendering:

```tsx
resizeHandle={(axis: string, ref: React.Ref<HTMLElement>) => (
  <div
    ref={ref}
    className={`custom-handle custom-handle-${axis}`}
  />
)}
```

This can be used for custom-styled corner grips instead of the default `::after` pseudo-element.

### Pattern 4: shadcn ContextMenu Wrapping Grid Items

Wrap each panel's outer div with `<ContextMenu>`:

```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

<ContextMenu>
  <ContextMenuTrigger asChild>
    <div key={instance.id}>
      <PanelFrame ... />
    </div>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Add Panel...</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem>Duplicate</ContextMenuItem>
    <ContextMenuItem>Remove</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem>Reset Layout</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

For empty grid space: wrap the grid container itself with a separate ContextMenu that has panel-specific items disabled.

### Pattern 5: Context Menu on Grid Container (Empty Space)

Wrap the entire PanelGrid container div with ContextMenu for right-clicking empty space:

```tsx
<ContextMenu>
  <ContextMenuTrigger asChild>
    <div ref={containerRef} className="h-full w-full">
      <Responsive ...>
        {/* panels with their own context menus */}
      </Responsive>
    </div>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Add Panel...</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem disabled>Duplicate</ContextMenuItem>
    <ContextMenuItem disabled>Remove</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem>Reset Layout</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

### Anti-Patterns to Avoid

- **Don't create custom drag logic** — react-grid-layout handles all drag/drop/resize internally
- **Don't listen for mousedown on panel body** — use `draggableHandle` selector to restrict drag zone
- **Don't build a custom context menu** — shadcn ContextMenu handles positioning, keyboard nav, a11y
  </architecture_patterns>

<dont_hand_roll>

## Don't Hand-Roll

| Problem          | Don't Build                           | Use Instead                                | Why                                                  |
| ---------------- | ------------------------------------- | ------------------------------------------ | ---------------------------------------------------- |
| Context menu     | Custom onContextMenu + positioned div | shadcn ContextMenu                         | Handles positioning, keyboard nav, a11y, focus trap  |
| Resize handles   | Custom mouse event listeners          | react-grid-layout `resizeHandles` prop     | Already built, handles edge cases, cursor management |
| Drag constraints | Custom drag boundary checks           | `draggableHandle` + `isBounded` props      | Built into the library                               |
| Handle styling   | JavaScript-based visibility toggle    | CSS overrides on `.react-resizable-handle` | Library applies correct classes automatically        |

**Key insight:** react-grid-layout and shadcn together cover 100% of the interaction requirements. No custom interaction code needed — just props and CSS.
</dont_hand_roll>

<common_pitfalls>

## Common Pitfalls

### Pitfall 1: Context Menu Conflicts with Drag

**What goes wrong:** Right-click on panel header triggers both context menu AND drag start
**Why it happens:** mousedown fires before contextmenu event
**How to avoid:** react-grid-layout only triggers drag on left-click (button 0). Right-click (button 2) won't trigger drag. No conflict expected, but test to verify.
**Warning signs:** Panel moves when right-clicking

### Pitfall 2: Nested Context Menus (Panel + Grid)

**What goes wrong:** Right-clicking a panel triggers both the panel's context menu AND the grid container's context menu
**Why it happens:** Context menu events bubble up the DOM
**How to avoid:** Use `event.stopPropagation()` on the panel's ContextMenuTrigger, or handle at the ContextMenu level — Radix ContextMenu already handles this by capturing the event. Test with nested ContextMenus.
**Warning signs:** Two menus appear on right-click

### Pitfall 3: Resize Handle Z-Index Under Panel Content

**What goes wrong:** Corner resize handles are behind panel content, unreachable
**Why it happens:** Panel content has higher z-index or `overflow: hidden` clips handles
**How to avoid:** Ensure `.react-resizable-handle` has `z-index: 10` and panels don't clip overflow at the edges
**Warning signs:** Can't grab corner to resize despite visible handle

### Pitfall 4: Full-Header Drag Handle Blocks Header Buttons

**What goes wrong:** Making the entire header a drag handle prevents clicking the × remove button
**Why it happens:** `draggableCancel` not set for interactive elements within the drag zone
**How to avoid:** Use `draggableCancel=".panel-action-button"` to exclude buttons from drag initiation. Add that class to any clickable elements in the header.
**Warning signs:** Clicking × starts a drag instead of removing the panel
</common_pitfalls>

<code_examples>

## Code Examples

### react-grid-layout: Four-Corner Resize Handles

```tsx
// Source: react-grid-layout API docs (Context7)
<Responsive
  resizeHandles={['nw', 'ne', 'sw', 'se']}
  isDraggable={true}
  isResizable={true}
  draggableHandle=".panel-drag-handle"
  draggableCancel=".panel-action-button"
>
```

### CSS: Dark Theme Handle Overrides

```css
/* Make handles always visible with electric blue accent */
.react-grid-item > .react-resizable-handle {
  opacity: 0.4;
}

.react-grid-item:hover > .react-resizable-handle {
  opacity: 1;
}

.react-grid-item > .react-resizable-handle::after {
  border-right-color: oklch(0.62 0.22 230 / 0.6);
  border-bottom-color: oklch(0.62 0.22 230 / 0.6);
}

.react-grid-item:hover > .react-resizable-handle::after {
  border-right-color: oklch(0.62 0.22 230);
  border-bottom-color: oklch(0.62 0.22 230);
}

/* Remove default SVG background (black, invisible on dark) */
.react-resizable-handle {
  background-image: none !important;
}

/* Electric blue drag placeholder */
.react-grid-item.react-grid-placeholder {
  background: oklch(0.62 0.22 230);
  opacity: 0.15;
  border-radius: 2px;
}
```

### shadcn ContextMenu: Panel Context Menu

```tsx
// Source: shadcn/ui docs (Context7)
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

function PanelContextMenu({
  children,
  onAddPanel,
  onDuplicate,
  onRemove,
  onReset,
  isPanelTarget,
}: Props) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={onAddPanel}>Add Panel...</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled={!isPanelTarget} onSelect={onDuplicate}>
          Duplicate
        </ContextMenuItem>
        <ContextMenuItem disabled={!isPanelTarget} onSelect={onRemove}>
          Remove
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={onReset}>Reset Layout</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

</code_examples>

<open_questions>

## Open Questions

1. **Nested ContextMenu behavior with Radix**
   - What we know: Radix ContextMenu captures right-click events
   - What's unclear: Whether nested ContextMenus (panel inside grid) conflict or if inner menu takes priority
   - Recommendation: Test during implementation. If conflict, use single ContextMenu on grid with panel detection via event target

2. **draggableCancel interaction with ContextMenu**
   - What we know: `draggableCancel` excludes elements from drag initiation
   - What's unclear: Whether ContextMenuTrigger interferes with drag cancel detection
   - Recommendation: Add `.panel-action-button` class to any interactive elements in header, test drag + right-click coexistence
     </open_questions>

<sources>
## Sources

### Primary (HIGH confidence)

- `/react-grid-layout/react-grid-layout` (Context7) — API docs, resizeHandles, draggableHandle, ResizeConfig
- `/shadcn/ui` (Context7) — ContextMenu component, installation, usage patterns

### Secondary (MEDIUM confidence)

- react-grid-layout CSS source (node_modules) — handle class names, cursor values, z-index
- react-resizable CSS source (node_modules) — handle positioning, SVG background

### Tertiary (LOW confidence)

- None — all findings verified against Context7 docs
  </sources>

<metadata>
## Metadata

**Research scope:**

- Core technology: react-grid-layout v2 customization
- Ecosystem: shadcn ContextMenu (needs installation)
- Patterns: Always-on editing, four-corner handles, context menu wrapping
- Pitfalls: Event conflicts, z-index, drag cancel

**Confidence breakdown:**

- Standard stack: HIGH — verified with Context7, already installed
- Architecture: HIGH — props documented in API, patterns clear
- Pitfalls: MEDIUM — theoretical conflicts need testing during implementation
- Code examples: HIGH — from Context7/official sources

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (30 days — react-grid-layout stable)
</metadata>

---

_Phase: 14-view-wiring_
_Research completed: 2026-03-18_
_Ready for planning: yes_
