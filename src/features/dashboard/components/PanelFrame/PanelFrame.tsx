import { X, GripVertical } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

import type { PanelFrameProps } from './PanelFrame.types';

import { Show } from '@/shared/components/Show';

export function PanelFrame({
  panelId,
  title,
  children,
  onClose,
  onReset,
  onTabWith,
  isSovereign = false,
  isClosable = true,
  showDragHandle = true,
}: PanelFrameProps) {
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const canClose = isClosable && !isSovereign;

  // Close menu on outside click
  useEffect(() => {
    if (!contextMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('click', handleClick);
    };
  }, [contextMenuOpen]);

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setContextMenuOpen(true);
  }

  function handleReset() {
    setContextMenuOpen(false);
    onReset?.();
  }

  function handleRemove() {
    setContextMenuOpen(false);
    onClose?.(panelId);
  }

  function handleTabWith() {
    setContextMenuOpen(false);
    if (!isSovereign) onTabWith?.();
  }

  return (
    <div
      className={[
        'relative flex h-full flex-col overflow-hidden rounded border border-border bg-card',
        isSovereign ? 'border-l-2 border-l-primary' : '',
      ]
        .join(' ')
        .trim()}
    >
      {/* Header */}
      <div
        data-testid="panel-header"
        className="flex shrink-0 items-center gap-1 border-b border-border bg-muted px-2 py-1"
        onContextMenu={handleContextMenu}
      >
        <Show when={showDragHandle}>
          <span
            data-testid="drag-handle"
            className="cursor-grab text-muted-foreground"
          >
            <GripVertical size={14} />
          </span>
        </Show>

        <span className="flex-1 truncate text-xs font-medium text-card-foreground">
          {title}
        </span>

        <Show when={canClose}>
          <button
            type="button"
            aria-label="Close panel"
            onClick={() => onClose?.(panelId)}
            className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X size={12} />
          </button>
        </Show>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">{children}</div>

      {/* Context Menu */}
      <Show when={contextMenuOpen}>
        <div
          ref={menuRef}
          role="menu"
          className="absolute left-0 top-8 z-50 min-w-[160px] rounded border border-border bg-muted py-1 shadow-lg"
        >
          <button
            role="menuitem"
            type="button"
            onClick={handleReset}
            className="w-full px-3 py-1.5 text-left text-xs text-card-foreground hover:bg-secondary"
          >
            Reset to Default
          </button>

          <Show when={canClose}>
            <button
              role="menuitem"
              type="button"
              onClick={handleRemove}
              className="w-full px-3 py-1.5 text-left text-xs text-card-foreground hover:bg-secondary"
            >
              Remove Panel
            </button>
          </Show>

          <button
            role="menuitem"
            type="button"
            aria-disabled={isSovereign ? 'true' : undefined}
            onClick={handleTabWith}
            disabled={isSovereign}
            className="w-full px-3 py-1.5 text-left text-xs text-card-foreground hover:bg-secondary disabled:opacity-40"
          >
            Tab with…
          </button>
        </div>
      </Show>
    </div>
  );
}
