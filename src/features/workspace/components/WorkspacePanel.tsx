import { Maximize2, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConditionalRender } from '@/components/ConditionalRender';
import type { WorkspacePanelProps } from '../types/WorkspacePanel.types';
import { TopicSelector } from './TopicSelector';

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
        {topicName ? <TopicSelector topicName={topicName} /> : <span className="ml-1" />}
        <div className="ml-auto flex items-center gap-1 shrink-0">
          {headerActions}
          <ConditionalRender
            shouldRender={!!onMinimize}
            Component={
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onMinimize}
                aria-label="Minimize panel"
                className="text-text-muted hover:text-text-primary hover:bg-surface-tertiary"
              >
                <Minus className="size-3" />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Fullscreen"
            className="text-text-muted hover:text-text-primary hover:bg-surface-tertiary"
          >
            <Maximize2 className="size-3" />
          </Button>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex items-center justify-center p-4">{children}</div>
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
