/**
 * sidebar definitions
 */

import { ConnectionStatus } from "@/components//dashboard/definitions"

export interface ConnectionDialogFormData {
  connectionName: string,
  webSocketUrl: string
}

export interface ConnectionsListItemProps {
  handleDisconnect: () => void
  handleReconnect: () => void
  handleRemoveConnection: () => void
  handleSelectConnection: () => void
  isSelected: boolean
  name: string
  removeConnection: (id: string ) => void
  status: ConnectionStatus
  url: string,
}