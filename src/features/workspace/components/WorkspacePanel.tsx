import { ChevronDown, Maximize2, Minus } from 'lucide-react';

/**
 *
 */
export function WorkspacePanel({
  label,
  icon: Icon,
  topicName,
  headerActions,
  footerActions,
  onMinimize,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  topicName?: string;
  headerActions?: React.ReactNode;
  footerActions?: React.ReactNode;
  onMinimize?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative bg-surface-primary border border-border rounded-sm shadow-[inset_0_1px_0_0_var(--color-surface-glow)] flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 h-9 shrink-0 border-b border-border">
        <Icon className="size-3.5 text-text-muted shrink-0" />
        <span className="font-mono text-xs font-semibold text-text-secondary uppercase tracking-widest shrink-0">
          {label}
        </span>
        {topicName ? (
          <button
            aria-label="Topic options"
            className="ml-1 flex items-center gap-1 font-mono text-xs text-text-muted hover:text-accent transition-colors cursor-pointer truncate"
          >
            {topicName}
            <ChevronDown className="size-3 shrink-0" />
          </button>
        ) : (
          <span className="ml-1" />
        )}
        <div className="ml-auto flex items-center gap-1 shrink-0">
          {headerActions}
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="p-1 rounded-sm text-text-muted hover:text-text-primary hover:bg-surface-tertiary transition-colors cursor-pointer"
              aria-label="Minimize panel"
            >
              <Minus className="size-3" />
            </button>
          )}
          <button
            className="p-1 rounded-sm text-text-muted hover:text-text-primary hover:bg-surface-tertiary transition-colors cursor-pointer"
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
        {footerActions && (
          <div className="flex justify-end items-center px-3 h-9 shrink-0 border-t border-border">
            {footerActions}
          </div>
        )}
      </div>
    </div>
  );
}
