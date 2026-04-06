import { Maximize2, Minimize2, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PanelErrorBoundary } from '@/components/PanelErrorBoundary';
import type { WorkspacePanelProps } from './WorkspacePanel.types';
import { TopicSelector } from '../TopicSelector';

/** WorkspacePanel
 * @description Renders a reusable panel container with header controls
 *  and content area. Accepts a component and its props to render inside
 *  the panel body. Supports minimize and maximize actions.
 * @prop label - Panel title displayed in the header.
 * @prop icon - Lucide icon component for the header.
 * @prop Component - The panel content component to render.
 * @prop componentProps - Props to pass to the panel content component.
 * @prop topicName - Optional ROS topic name shown in the header.
 * @prop onMinimize - Optional callback to minimize the panel.
 * @prop onMaximize - Optional callback to maximize the panel.
 * @prop onRestoreAll - Optional callback to restore all panels from maximized state.
 * @prop maximized - Whether this panel is currently maximized.
 */
export function WorkspacePanel({
  availableTopics,
  Component,
  componentProps,
  headerActions,
  icon: Icon,
  label,
  maximized,
  onMaximize,
  onMinimize,
  onRestoreAll,
  onTopicChange,
  topicName,
}: WorkspacePanelProps) {
  const canMinimize = !!onMinimize && !maximized;

  return (
    <article className="relative bg-surface-primary border border-border rounded-sm shadow-glow-top flex flex-col h-full">
      <header className="flex items-center gap-2 px-3 h-9 shrink-0 border-b border-border min-w-0">
        <Icon className="size-3.5 text-text-muted shrink-0" aria-hidden="true" />
        <span className="font-mono text-xs font-semibold text-text-secondary uppercase tracking-widest shrink-0">
          {label}
        </span>
        {topicName ? (
          <div className="min-w-0 shrink" title={topicName}>
            <TopicSelector
              topicName={topicName}
              availableTopics={availableTopics}
              onTopicChange={onTopicChange}
            />
          </div>
        ) : (
          <span className="ml-1" />
        )}
        <div className="ml-auto flex items-center gap-1 shrink-0">
          {headerActions}
          {canMinimize && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onMinimize}
              aria-label="Minimize panel"
              className="text-text-muted hover:text-text-primary hover:bg-surface-tertiary"
            >
              <Minus className="size-3" />
            </Button>
          )}
          {maximized ? (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onRestoreAll}
              aria-label="Restore all panels"
              className="text-accent hover:text-text-primary hover:bg-surface-tertiary"
            >
              <Minimize2 className="size-3" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onMaximize}
              aria-label="Maximize panel"
              className="text-text-muted hover:text-text-primary hover:bg-surface-tertiary"
            >
              <Maximize2 className="size-3" />
            </Button>
          )}
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-4 min-h-0 overflow-hidden">
        <PanelErrorBoundary>
          <Component {...componentProps} />
        </PanelErrorBoundary>
      </div>
    </article>
  );
}
