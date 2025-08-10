import {
  Crosshair,
  Ellipsis,
  Plug,
  Trash,
  Unplug
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

import { ConnectionsListItemProps } from "./definitions";

/**
 * ConnectionListItem
 */
export default function ConnnectionListItem({
	handleDisconnect,
	handleReconnect,
	handleSelectConnection,
  handleRemoveConnection,
  isSelected,
  name,
  status,
  url,
}: ConnectionsListItemProps): React.ReactNode {

  const buttonProps = status === 'connected'
     ?{
      'aria-label': `Disconnect from ${name}`,
      className: 'bg-green-300 hover:bg-green-200 h-5 w-5',
      onClick: handleDisconnect,
      variant: 'destructive' as const,
    } : {
      'aria-label': `reconnect to ${name}`,
      className: 'bg-red-500 hover:bg-red-300 h-5 w-5',
      onClick: handleReconnect,
      variant: 'secondary' as const,
    };

  return (
    <li>
      <Accordion
        className="w-full"
        defaultValue="item-1"
        collapsible
        type="single"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="p-0">
            <span className="font-semibold">{name}</span>
          </AccordionTrigger>
          <AccordionContent className="rounded-md bg-accent p-2">
            <div className="items-center flex gap-2 flex-row-reverse">
              <Button
                aria-label="More data source details"
                className="h-5 w-5"
                variant="outline"
              >
                <Ellipsis />
              </Button>
              <Button
                className="h-5 w-5 hover:opacity-70"
                onClick={handleSelectConnection}
              >
                <Crosshair fill={isSelected ? "green" : ""} />
              </Button>
              <Button {...buttonProps}>
                {status !== 'connected'
                  ? <Unplug />
                  : <Plug />
                }
              </Button>
              <Button
                aria-label="remove connecton"
                className="h-5 w-5 hover:bg-orange-500 bg-orange-700"
                onClick={handleRemoveConnection}
                variant="destructive"
              >
                <Trash />
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </li>
  )
}