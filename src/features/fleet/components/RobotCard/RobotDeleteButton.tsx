import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { RobotDeleteButtonProps } from '@/features/fleet/types/RobotDeleteButton.types';

// TODO: When wiring real connections, add loading state to Remove button:
// - Disable button + show spinner while deletion is in progress
// - Show error toast if deletion fails with retry option

/** RobotDeleteButton
 * @description Renders a trash icon that opens an AlertDialog confirmation
 *  before removing a robot.
 * @param robotName - Robot name displayed in the confirmation dialog.
 * @param onRemove - Callback invoked when the user confirms removal.
 */
export function RobotDeleteButton({
  robotName,
  onRemove,
}: RobotDeleteButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Remove ${robotName}`}
          className="size-8 min-w-11 text-text-muted hover:text-status-critical"
        >
          <Trash2 size={14} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-surface-primary border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-sans text-text-primary">
            Remove {robotName}?
          </AlertDialogTitle>
          <AlertDialogDescription className="font-sans text-sm text-text-muted">
            This will remove the robot from your fleet. You can add it back
            later with the same connection details.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="font-sans text-xs uppercase tracking-widest">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onRemove}
            className="bg-status-critical text-white hover:bg-status-critical/75 font-sans text-xs uppercase tracking-widest"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
