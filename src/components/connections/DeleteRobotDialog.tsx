/**
 * DeleteRobotDialog
 *
 * Confirmation dialog for deleting a robot connection.
 */

import { AlertTriangle } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { RobotConnection } from '@/contexts/ros/definitions';

interface DeleteRobotDialogProps {
  robot: RobotConnection | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteRobotDialog({
  robot,
  onClose,
  onConfirm,
}: DeleteRobotDialogProps) {
  return (
    <AlertDialog open={!!robot} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 font-mono">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            DELETE ROBOT CONNECTION
          </AlertDialogTitle>
          <AlertDialogDescription className="font-mono">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">{robot?.name}</span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="font-mono">CANCEL</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90 font-mono"
          >
            DELETE
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
