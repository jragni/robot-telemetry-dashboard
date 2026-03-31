import { Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WorkspacePanelProps } from '../types/WorkspacePanel.types';
import { TopicSelector } from './TopicSelector';

/** WorkspacePanel
 * @description Renders a reusable panel container with header controls
 *  and content area. Provides consistent styling across all workspace panels.
 * @param label - Panel title displayed in the header.
 * @param icon - Lucide icon component for the header.
 * @param topicName - Optional ROS topic name shown in the header.
 * @param headerActions - Optional additional header controls.
 * @param children - Panel content.
 */
export function WorkspacePanel({
  label,
  icon: Icon,
  topicName,
  headerActions,
  children,
}: WorkspacePanelProps) {
  return (
    <article className="relative bg-surface-primary border border-border rounded-sm shadow-glow-top flex flex-col h-full">
      <header className="flex items-center gap-2 px-3 h-9 shrink-0 border-b border-border">
        <Icon className="size-3.5 text-text-muted shrink-0" aria-hidden="true" />
        <span className="font-mono text-xs font-semibold text-text-secondary uppercase tracking-widest shrink-0">
          {label}
        </span>
        {topicName ? <TopicSelector topicName={topicName} /> : <span className="ml-1" />}
        <div className="ml-auto flex items-center gap-1 shrink-0">
          {headerActions}
          <Button
            variant="ghost"
            size="icon-xs"
            disabled
            aria-label="Fullscreen"
            className="text-text-muted hover:text-text-primary hover:bg-surface-tertiary"
          >
            <Maximize2 className="size-3" />
          </Button>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-4 min-h-0">{children}</div>
    </article>
  );
}
