import { LayoutDashboard, PlusCircle, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import { AddPanelDialog } from './AddPanelDialog';
import type { PanelToolbarProps } from './PanelToolbar.types';

import { Show } from '@/components/shared/Show';
import { Button } from '@/components/ui/button';
import { useMobile } from '@/hooks/use-mobile';
import { useLayoutStore } from '@/stores/layout/layout.store';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PanelToolbar({ viewId }: PanelToolbarProps) {
  const isMobile = useMobile();
  const editMode = useLayoutStore((s) => s.editMode);

  const [addPanelOpen, setAddPanelOpen] = useState(false);

  // Toolbar is hidden on mobile — touch layout editing is not supported
  if (isMobile) return null;

  return (
    <>
      <div className="flex items-center gap-2 px-3 py-2 bg-card border-b border-border">
        {/* Edit / Done toggle */}
        <Button
          variant={editMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => useLayoutStore.getState().setEditMode(!editMode)}
          aria-pressed={editMode}
        >
          <LayoutDashboard />
          {editMode ? 'Done Editing' : 'Edit Layout'}
        </Button>

        {/* Actions only visible during edit mode */}
        <Show when={editMode}>
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddPanelOpen(true)}
            >
              <PlusCircle />
              Add Panel
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => useLayoutStore.getState().resetLayout(viewId)}
            >
              <RotateCcw />
              Reset Layout
            </Button>
          </>
        </Show>
      </div>

      <AddPanelDialog
        viewId={viewId}
        open={addPanelOpen}
        onOpenChange={setAddPanelOpen}
      />
    </>
  );
}
