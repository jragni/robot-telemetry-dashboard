import { Button } from '@/components/ui/button';

import { WORKSPACE_PANEL_META } from '../constants';
import type { MinimizedPanelBarProps } from './MinimizedPanelBar.types';

/** MinimizedPanelBar
 * @description Renders a horizontal nav bar of buttons for restoring minimized
 *  workspace panels. Each button shows the panel icon and label. Returns null
 *  when no panels are minimized.
 * @prop isMinimized - Predicate that returns true if a panel ID is minimized.
 * @prop minimizedIds - Set of currently minimized panel IDs.
 * @prop onRestore - Callback to restore a minimized panel by ID.
 */
export function MinimizedPanelBar({
  isMinimized,
  minimizedIds,
  onRestore,
}: MinimizedPanelBarProps) {
  if (minimizedIds.size === 0) return null;

  return (
    <nav aria-label="Minimized panels" className="flex items-center gap-1 shrink-0">
      {WORKSPACE_PANEL_META.filter((p) => isMinimized(p.id)).map((panel) => (
        <Button
          key={panel.id}
          variant="outline"
          size="sm"
          onClick={() => {
            onRestore(panel.id);
          }}
          className="font-mono text-xs text-text-muted hover:text-text-primary cursor-pointer"
        >
          <panel.icon className="size-3" aria-hidden="true" />
          {panel.label}
        </Button>
      ))}
    </nav>
  );
}
