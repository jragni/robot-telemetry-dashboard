/**
 * sidebar definitions
 */

import { ConnectionStatus } from '@/components//dashboard/definitions';
import { RobotConnection } from '@/components/dashboard/definitions';
export interface ConnectionDialogFormData {
  connectionName: string,
  webSocketUrl: string
}

export interface ConnectionInfoDialogProps {
  handleDisconnect: () => void
  handleReconnect: () => void
  handleRemoveConnection: () => void
  id: string
  name: string
  status: string
  url: string
}

export interface ConnectionsListItemProps {
  handleDisconnect: () => void
  handleReconnect: () => void
  handleRemoveConnection: () => void
  handleSelectConnection: () => void
  id: string
  isSelected: boolean
  name: string
  removeConnection: (id: string ) => void
  status: ConnectionStatus
  url: string,
}

export interface ConnectionListProps {
  connections: RobotConnection[]
  disconnect: (id: string) => void
  reconnect: (id: string) => void
  removeConnection: (id: string) => void
  selectedConnectionId: string
  setSelectedConnectionId: (id: string) => void
}
