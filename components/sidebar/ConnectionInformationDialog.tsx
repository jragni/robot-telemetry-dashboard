import {
  Ellipsis,
  Plug,
  Trash,
  Unplug,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

import { ConnectionInfoDialogProps } from './definitions';

/**
 * ConnectionInfoDialog
 *
 * @description
 * Displays Connection info, rendered by ConnectionListItem
 */

export default function ConnectionInfoDialog({
  handleDisconnect,
  handleReconnect,
  handleRemoveConnection,
  id,
  name,
  status,
  url,
}: ConnectionInfoDialogProps): React.ReactNode {
  const buttonProps = status === 'connected'
    ?{
      'aria-label': `Disconnect from ${name}`,
      className: 'bg-green-500 hover:bg-green-300 dark:bg-green-500 dark:hover:bg-green-300 h-5 w-5',
      onClick: handleDisconnect,
      variant: 'destructive' as const,
    } : {
      'aria-label': `reconnect to ${name}`,
      className: 'bg-red-500 hover:bg-red-300 h-5 w-5',
      onClick: handleReconnect,
      variant: 'secondary' as const,
    };

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
              <div className="flex gap-2">
                <Button {...buttonProps}>
                  {status !== 'connected'
                    ? <Unplug />
                    : <Plug />
                  }
                </Button>
                <p className="text-sm text-muted-foreground">{status}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">WebSocket URL</Label>
              <p className="text-sm text-muted-foreground break-all">{url}</p>
            </div>
          </div>
          <div className="flex-row-reverse items-center flex gap-2">
            <Button
              aria-label="remove connecton"
              className=" hover:bg-orange-500 bg-orange-700"
              onClick={handleRemoveConnection}
              variant="destructive"
            >
              <Trash />
              Remove Connection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}