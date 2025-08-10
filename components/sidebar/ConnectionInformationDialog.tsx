import { Ellipsis } from "lucide-react";

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

import { ConnectionInfoDialogProps } from './definitions';

/**
 * ConnectionInfoDialog
 *
 * @description
 * Displays Connection info, rendered by ConnectionListItem
 */

export default function ConnectionInfoDialog({
  id,
  name,
  status,
  url,
}: ConnectionInfoDialogProps): React.ReactNode {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          aria-label="More data source details"
          className="h-5 w-5"
          onClick={() => null}
          variant="outline"
        >
          <Ellipsis />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Connection Information</DialogTitle>
          <DialogDescription>
            Detailed information about the robot connection
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Data Source Name</Label>
              <p className="text-sm text-muted-foreground">{name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Connection ID</Label>
              <p className="text-sm text-muted-foreground font-mono">{id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <p className="text-sm text-muted-foreground">{status}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">WebSocket URL</Label>
              <p className="text-sm text-muted-foreground break-all">{url}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}