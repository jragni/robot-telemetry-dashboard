import { ChevronDown, Maximize2, Minus } from 'lucide-react';
import { ConditionalRender } from '@/components/ConditionalRender';
import type { WorkspacePanelProps } from '../types/WorkspacePanel.types';

/** TopicSelector
 * @description Renders the topic name button with dropdown chevron for
 *  panel topic selection.
 * @param topicName - The ROS topic name to display.
 */
function TopicSelector({ topicName }: { topicName: string }) {
  return (
    <button
      aria-label="Topic options"
      className="ml-1 flex items-center gap-1 font-mono text-xs text-text-muted hover:text-accent transition-colors cursor-pointer truncate focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
    >
      {topicName}
      <ChevronDown className="size-3 shrink-0" />
    </button>
  );
}

/** WorkspacePanel
 * @description Renders a reusable panel container with header controls,
 *  content area, and optional footer.
 */
export function WorkspacePanel({
  label,
  icon: Icon,
  topicName,
  headerActions,
  footerActions,
  onMinimize,
  children,
}: WorkspacePanelProps) {
  return (
    <div className="relative bg-surface-primary border border-border rounded-sm shadow-glow-top flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 h-9 shrink-0 border-b border-border">
        <Icon className="size-3.5 text-text-muted shrink-0" />
        <span className="font-mono text-xs font-semibold text-text-secondary uppercase tracking-widest shrink-0">
          {label}
        </span>
        {topicName ? (
          <TopicSelector topicName={topicName} />
        ) : (
          <span className="ml-1" />
        )}
        <div className="ml-auto flex items-center gap-1 shrink-0">
          {headerActions}
          <ConditionalRender
            shouldRender={!!onMinimize}
            Component={
              <button
                onClick={onMinimize}
                className="p-1 rounded-sm text-text-muted hover:text-text-primary hover:bg-surface-tertiary transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                aria-label="Minimize panel"
              >
                <Minus className="size-3" />
              </button>
            }
          />
          <button
            className="p-1 rounded-sm text-text-muted hover:text-text-primary hover:bg-surface-tertiary transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            aria-label="Fullscreen"
          >
            <Maximize2 className="size-3" />
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex items-center justify-center p-4">
          {children}
        </div>
        <ConditionalRender
          shouldRender={!!footerActions}
          Component={
            <div className="flex justify-end items-center px-3 h-9 shrink-0 border-t border-border">
              {footerActions}
            </div>
          }
        />
      </div>
    </div>
  );
}
