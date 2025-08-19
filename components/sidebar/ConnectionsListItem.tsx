import { Crosshair } from 'lucide-react';

import { Button } from '@/components/ui/button';
import PingDisplay from '@/components/dashboard/PingDisplay';

import { ConnectionsListItemProps } from './definitions';
import ConnectionInformationDialog from './ConnectionInformationDialog';

/**
 * ConnectionListItem
 */
export default function ConnnectionListItem({
  handleDisconnect,
  handleReconnect,
  handleSelectConnection,
  handleRemoveConnection,
  id,
  isSelected,
  name,
  status,
  url,
  ping,
}: ConnectionsListItemProps): React.ReactNode {


  return (
    <li className="flex items-center justify-between py-2">
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-sm">{name}</span>
        <PingDisplay compact ping={ping} showLabel />
      </div>
      <div className="flex gap-2">
        <Button
          className="h-5 w-5 hover:opacity-70"
          onClick={handleSelectConnection}
        >
          <Crosshair fill={isSelected ? 'green' : ''} />
        </Button>
        <ConnectionInformationDialog
          handleDisconnect={handleDisconnect}
          handleReconnect={handleReconnect}
          handleRemoveConnection={handleRemoveConnection}
          id={id}
          name={name}
          status={status}
          url={url}
        />
      </div>
    </li>
  );
}
