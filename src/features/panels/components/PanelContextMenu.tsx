import { Copy, PlusCircle, RotateCcw, Trash2 } from 'lucide-react';

import type { PanelContextMenuProps } from './PanelContextMenu.types';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useLayoutStore } from '@/stores/layout/layout.store';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PanelContextMenu({
  children,
  viewId,
  panelId,
  onAddPanel,
}: PanelContextMenuProps) {
  function handleRemove() {
    if (panelId) {
      useLayoutStore.getState().removePanel(viewId, panelId);
    }
  }

  function handleResetLayout() {
    useLayoutStore.getState().resetLayout(viewId);
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onAddPanel}>
          <PlusCircle size={14} />
          Add Panel...
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem disabled>
          <Copy size={14} />
          Duplicate
        </ContextMenuItem>

        <ContextMenuItem
          variant="destructive"
          disabled={panelId === undefined}
          onClick={handleRemove}
        >
          <Trash2 size={14} />
          Remove
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={handleResetLayout}>
          <RotateCcw size={14} />
          Reset Layout
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
