import { useState } from 'react';
import { Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RobotDeleteButtonProps } from '../../types/RobotDeleteButton.types';

/**
 * @description RobotDeleteButton — Renders a delete button with inline confirmation.
 *  Shows trash icon, then "Remove?" with confirm/cancel.
 * @param robotName - Robot name used for aria-labels.
 * @param onRemove - Callback invoked when the user confirms removal.
 */
export function RobotDeleteButton({
  robotName,
  onRemove,
}: RobotDeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="font-mono text-xs text-text-muted mr-1">Remove?</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label={`Confirm remove ${robotName}`}
          className="w-7 h-7 text-status-nominal hover:bg-status-nominal-bg"
        >
          <Check size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setConfirming(false);
          }}
          aria-label="Cancel remove"
          className="w-7 h-7 text-text-muted hover:text-text-primary"
        >
          <X size={14} />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        setConfirming(true);
      }}
      aria-label={`Remove ${robotName}`}
      className="w-7 h-7 text-text-muted hover:text-status-critical"
    >
      <Trash2 size={14} />
    </Button>
  );
}
