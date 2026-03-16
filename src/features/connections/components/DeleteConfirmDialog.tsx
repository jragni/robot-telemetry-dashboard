import type { DeleteConfirmDialogProps } from './ConnectionsSidebar.types';

function DeleteConfirmDialog({
  robot,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div className="w-full max-w-sm rounded-sm border border-border bg-card p-5 shadow-xl">
        <h2
          id="delete-dialog-title"
          className="mb-2 font-mono text-sm font-semibold text-foreground"
        >
          Remove Robot
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Remove{' '}
          <span className="font-semibold text-foreground">{robot.name}</span>?
          This will disconnect it and delete its configuration.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1.5 rounded text-xs font-medium bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export { DeleteConfirmDialog };
