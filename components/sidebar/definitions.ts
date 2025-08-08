/**
 * sidebar definitions
 */

import { ConnectionStatus } from "@/components//dashboard/definitions"

export interface ConnectionDialogFormData {
  connectionName: string,
  webSocketUrl: string
}

export interface ConnectionsListItemProps {
  id: string
  name: string
  status: ConnectionStatus
}