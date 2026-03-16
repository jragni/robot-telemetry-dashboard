import { X } from 'lucide-react';
import { useEffect } from 'react';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PilotExitButtonProps {
  onExit: () => void;
}

// ---------------------------------------------------------------------------
// PilotExitButton
// ---------------------------------------------------------------------------

/**
 * Fixed top-right exit button for the pilot mode layout.
 *
 * - Clicking the button invokes {@link onExit}.
 * - Pressing the Escape key anywhere on the page also invokes {@link onExit}.
 */
export function PilotExitButton({ onExit }: PilotExitButtonProps) {
  // Escape key global handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onExit();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  return (
    <button
      onClick={onExit}
      aria-label="Exit Pilot Mode"
      title="Exit Pilot Mode (Esc)"
      className="
        flex items-center gap-2
        rounded border border-border/60
        bg-black/60 px-3 py-1.5
        font-mono text-xs uppercase tracking-wider text-foreground/80
        backdrop-blur-sm
        hover:bg-black/80 hover:text-foreground
        active:scale-95
        transition-all
      "
    >
      <X className="h-3.5 w-3.5" aria-hidden="true" />
      <span>Exit</span>
    </button>
  );
}
