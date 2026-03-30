import { useState, useCallback } from 'react';
import { WorkspacePanel } from './WorkspacePanel';
import { ConditionalRender } from '@/components/ConditionalRender';
import type { PanelConfig } from '../types/WorkspaceGrid.types';

export type { PanelConfig } from '../types/WorkspaceGrid.types';

/**
 * Manages the workspace grid layout for panels with minimize-to-dock functionality.
 * @param panels - Array of panel configurations to render in the grid.
 */
export function WorkspaceGrid({ panels }: { panels: PanelConfig[] }) {
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
        <div
          className="flex-1 grid gap-3 min-h-0"
          style={{ gridTemplateColumns: gridCols }}
        >
          {visiblePanels.map((panel) => (
            <WorkspacePanel
              key={panel.id}
              label={panel.label}
              icon={panel.icon}
              topicName={panel.topicName}
              footerActions={panel.footerActions}
              onMinimize={() => {
                minimize(panel.id);
              }}
            >
              {panel.content}
            </WorkspacePanel>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <span className="font-mono text-xs text-text-muted">
            All panels minimized — click a tab below to restore
          </span>
        </div>
      )}

      <ConditionalRender
        shouldRender={minimizedPanels.length > 0}
        Component={
          <nav
            aria-label="Minimized panels"
            className="flex items-center gap-1 shrink-0"
          >
            {minimizedPanels.map((panel) => (
              <button
                key={panel.id}
                onClick={() => {
                  restore(panel.id);
                }}
                className="flex items-center gap-1.5 px-3 h-8 bg-surface-secondary border border-border rounded-sm font-mono text-xs text-text-muted hover:text-text-primary hover:border-border-hover transition-colors cursor-pointer"
              >
                <panel.icon className="size-3" />
                {panel.label}
              </button>
            ))}
          </nav>
        }
      />
    </div>
  );
}
