'use client';

import { Card, CardContent } from '@/components/ui/card';
import ConnnectionListItem from './ConnectionsListItem';
import { ConnectionListProps } from './definitions';

/**
 * ConnectonsList
 */
export default function ConnectionsList({
  connections,
  disconnect,
  reconnect,
  removeConnection,
  selectedConnectionId,
  setSelectedConnectionId,
}: ConnectionListProps) {

  return (
    <Card>
      <CardContent>
        <ul>
          {connections.map(({
            id,
            name,
            status,
            url,
            ping,
          }) => (
            <ConnnectionListItem
              key={id}
              handleDisconnect={() => disconnect(id)}
              handleReconnect={() => reconnect(id)}
              handleRemoveConnection={() => removeConnection(id)}
              handleSelectConnection={() => setSelectedConnectionId(id === selectedConnectionId ? '' : id)}
              id={id}
              isSelected={id===selectedConnectionId}
              name={name}
              ping={ping}
              removeConnection={removeConnection}
              status={status}
              url={url}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}