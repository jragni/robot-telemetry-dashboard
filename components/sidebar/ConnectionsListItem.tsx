import { Plug, Trash, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useConnection } from "@/components/dashboard/ConnectionProvider";

import { ConnectionsListItemProps } from "./definitions";

/**
 * ConnectionListItem
 */
export default function ConnnectionListItem({
  id,
  name,
  status,
}: ConnectionsListItemProps): React.ReactNode {
  const { disconnect, reconnect, removeConnection } = useConnection();

  const buttonProps = status === 'disconnected'
    ? {
      'aria-label': `reconnect to ${name}`,
      className: 'bg-green-300 hover:bg-green-200 h-6 w-6',
      onClick: () => reconnect(id),
      variant: 'secondary' as const,
    } : {
      'aria-label': `Disconnect from ${name}`,
      className: 'bg-red-500 hover:bg-red-300 h-6 w-6',
      onClick: () => disconnect(id),
      variant: 'destructive' as const,
    };

  return (
    <li className="items-center flex justify-between">
      <span className="font-semibold">{name}</span>
      <div className="flex gap-2">
      <Button {...buttonProps}>
        {status !== 'connected'
          ? <Plug />
          : <Unplug />
        }
      </Button>
      <Button
        className="h-6 w-6 hover:bg-orange-500 bg-orange-700"
				onClick={() => removeConnection(id)}
        variant="destructive"
      >
        <Trash />
      </Button>
      </div>
    </li>
  )
}