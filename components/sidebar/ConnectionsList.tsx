"use client"

import { Card, CardContent } from "@/components/ui/card";
import { RobotConnection } from "@/components/dashboard/definitions";
import ConnnectionListItem from "./ConnectionsListItem";

export interface ConnectionListProps {
  connections: RobotConnection[]
  disconnect: (id: string) => void
  reconnect: (id: string) => void
  removeConnection: (id: string) => void
  selectedConnectionId: string
  setSelectedConnectionId: (id: string) => void
}

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
          }) => (
            <ConnnectionListItem
              key={id}
              handleDisconnect={() => disconnect(id)}
              handleReconnect={() => reconnect(id)}
              handleRemoveConnection={() => removeConnection(id)}
              handleSelectConnection={() => setSelectedConnectionId(id === selectedConnectionId ? "" : id)}
              isSelected={id===selectedConnectionId}
              name={name}
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