/** helpers */
import { RobotConnection } from "../dashboard/definitions";
import { ConnectionDialogFormData } from "./definitions";

interface ValidateAddConnectionFormResult {
  field?: 'connectionName' | 'webSocketUrl'
  status: 'invalid' | 'valid';
  reason: string;
}

export const validateAddConnectionForm = (
  formData: ConnectionDialogFormData,
  connections: Record<string, RobotConnection>
): ValidateAddConnectionFormResult => {
  const { connectionName, webSocketUrl } = formData;
  const connectionsList = Object.values(connections);

  // Validate empty
  if (!connectionName.length) return { field: 'connectionName', reason:'name cannot be empty', status:'invalid' };
  if (!webSocketUrl.length) return { field: 'webSocketUrl', reason: 'name cannot be empty', status:'invalid' };

  // Validate if name is already taken
  if (connectionsList.some(({ name }) => name === connectionName)) {
    return { field: 'connectionName', reason: 'duplicate name', status: 'invalid' };
  }

  // Validate if url is already being used
  if (connectionsList.some(({ url }) => url === webSocketUrl)) {
    return { field: 'webSocketUrl', reason: 'already connected to url', status: 'invalid' };
  }


  // Validate connection name length
  if (connectionName.trim().length < 2) {
    return { field: 'connectionName', reason: 'name too short', status: 'invalid' };
  }

  if (connectionName.trim().length > 50) {
    return { field: 'connectionName', reason: 'name too long', status: 'invalid' };
  }

  // Validate WebSocket URL format
  const wsUrlPattern = /^(ws|wss):\/\/[^\s/$.?#].[^\s]*$/i;
  if (!wsUrlPattern.test(webSocketUrl.trim())) {
    return { field: 'webSocketUrl', reason: 'invalid websocket url', status: 'invalid' };
  }

  // Additional URL validation
  try {
    const urlObj = new URL(webSocketUrl.trim());
    if (!urlObj.hostname) {
      return { field: 'webSocketUrl', reason: 'missing hostname', status: 'invalid' };
    }
  } catch {
    return { field: 'webSocketUrl', reason: 'malformed url', status: 'invalid' };
  }

  return { status: 'valid', reason: 'all validations passed' };
};

