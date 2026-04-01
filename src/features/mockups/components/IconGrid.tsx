import { ICON_SET } from '../constants';

/** IconGrid
 * @description Renders a grid of all Lucide React icons used across the
 *  application. Each cell shows the icon at 20px with its name below.
 */
export function IconGrid() {
  return (
    <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
      {ICON_SET.map((entry) => {
        const IconComponent = entry.Icon;
        return (
          <div
            key={entry.name}
            className="flex flex-col items-center gap-2 p-3 rounded-sm border border-border bg-surface-secondary"
          >
            <IconComponent className="size-5 text-text-primary" aria-hidden="true" />
            <span className="font-mono text-xs text-text-muted text-center">{entry.name}</span>
          </div>
        );
      })}
    </div>
  );
}
