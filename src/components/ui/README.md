# shadcn/ui Components

Auto-generated components installed via `npx shadcn@latest add <component>`.

## Do not manually edit

These files are managed by the shadcn CLI. Customizations (variants, sizes, disabled states) should be made carefully — `npx shadcn add --overwrite` will reset them.

## Installed components

- `alert-dialog.tsx` — Destructive action confirmation dialogs
- `badge.tsx` — Status and label badges
- `button.tsx` — Primary interactive element (customized: danger variant, hover/disabled states)
- `card.tsx` — Content containers (fleet cards, panels)
- `dialog.tsx` — Modal dialogs (AddRobotModal)
- `input.tsx` — Text input fields
- `popover.tsx` — Floating content panels
- `select.tsx` — Dropdown selection menus

## Customizations

`button.tsx` has project-specific modifications:

- `danger` variant (`bg-status-critical`)
- Hover: `/75` opacity + `shadow-md` for default, destructive, danger
- Disabled: `opacity-50` (shadcn default)

## Linting

This directory is excluded from ESLint (`eslint.config.js` ignores `src/components/ui/`).

## Adding new components

```bash
npx shadcn@latest add <component-name>
```

Requires `tsconfig.json` to have `paths: { "@/*": ["./src/*"] }` for correct path resolution.
