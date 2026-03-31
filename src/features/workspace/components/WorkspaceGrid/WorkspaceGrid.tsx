import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ConditionalRender } from '@/components/ConditionalRender';
import type { WorkspaceGridProps } from '@/features/workspace/types/WorkspaceGrid.types';
import { PanelGrid } from './PanelGrid';
import { AllMinimizedMessage } from './AllMinimizedMessage';

/** WorkspaceGrid
 * @description Manages the workspace grid layout for panels with
 *  minimize-to-dock functionality.
 * @param panels - Array of panel configurations to render in the grid.
 */
export function WorkspaceGrid({ panels }: WorkspaceGridProps) {
  const [minimized, setMinimized] = useState(new Set<string>());

  const minimize = useCallback((id: string) => {
    setMinimized((prev) => new Set([...prev, id]));
  }, []);

  const restore = useCallback((id: string) => {
    setMinimized((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const visiblePanels = panels.filter((p) => !minimized.has(p.id));
  const minimizedPanels = panels.filter((p) => minimized.has(p.id));

  const colCount = Math.min(visiblePanels.length, 3);
  const gridCols = colCount === 0 ? '1fr' : `repeat(${String(colCount)}, 1fr)`;

  return (
    <div className="flex flex-col h-full gap-3 p-4">
      {visiblePanels.length > 0 ? (
        <PanelGrid panels={visiblePanels} gridCols={gridCols} onMinimize={minimize} />
      ) : (
        <AllMinimizedMessage />
      )}

      <ConditionalRender
        shouldRender={minimizedPanels.length > 0}
        Component={
          <nav aria-label="Minimized panels" className="flex items-center gap-1 shrink-0">
            {minimizedPanels.map((panel) => (
              <Button
                key={panel.id}
                variant="outline"
                size="sm"
                onClick={() => {
                  restore(panel.id);
                }}
                className="font-mono text-xs text-text-muted hover:text-text-primary"
              >
                <panel.icon className="size-3" />
                {panel.label}
              </Button>
            ))}
          </nav>
        }
      />
    </div>
  );
}
