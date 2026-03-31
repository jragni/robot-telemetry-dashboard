import { WorkspacePanel } from '@/features/workspace/components/WorkspacePanel';
import type { PanelGridProps } from '@/features/workspace/types/WorkspaceGrid.types';

/** PanelGrid
 * @description Renders the visible panels in a responsive grid layout.
 * @param panels - Array of visible panel configurations.
 * @param gridCols - CSS grid-template-columns value.
 * @param onMinimize - Callback to minimize a panel by id.
 */
export function PanelGrid({ panels, gridCols, onMinimize }: PanelGridProps) {
  return (
    <div className="flex-1 grid gap-3 min-h-0" style={{ gridTemplateColumns: gridCols }}>
      {panels.map((panel) => (
        <WorkspacePanel
          key={panel.id}
          label={panel.label}
          icon={panel.icon}
          topicName={panel.topicName}
          footerActions={panel.footerActions}
          onMinimize={() => {
            onMinimize(panel.id);
          }}
        >
          {panel.content}
        </WorkspacePanel>
      ))}
    </div>
  );
}
