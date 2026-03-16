import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PANEL_REGISTRY } from '@/features/panels/panel.registry';
import type { PanelTypeId, ViewId } from '@/features/panels/panel.types';
import { useLayoutStore } from '@/stores/layout.store';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AddPanelDialogProps {
  viewId: ViewId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AddPanelDialog({
  viewId,
  open,
  onOpenChange,
}: AddPanelDialogProps) {
  function handleSelect(typeId: PanelTypeId) {
    useLayoutStore.getState().addPanel(viewId, typeId);
    onOpenChange(false);
  }

  const entries = Object.values(PANEL_REGISTRY);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Panel</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {entries.map((meta) => {
            const Icon = meta.icon;
            return (
              <button
                key={meta.typeId}
                type="button"
                onClick={() => handleSelect(meta.typeId)}
                className="flex items-start gap-3 rounded-sm border border-border bg-card p-3 text-left transition-colors hover:bg-accent hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="mt-0.5 shrink-0 text-primary">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-mono font-semibold tracking-[0.15em] uppercase text-primary">
                    {meta.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                    {meta.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
