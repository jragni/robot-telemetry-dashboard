import type { DisconnectedOverlayProps } from '@/features/workspace/types/RobotWorkspace.types';

/** DisconnectedOverlay
 * @description Renders a disconnected state message for a workspace panel.
 * @param robotName - The display name of the disconnected robot.
 */
export function DisconnectedOverlay({ robotName }: DisconnectedOverlayProps) {
  return (
    <span className="font-mono text-xs text-text-muted text-center">
      {robotName} is not connected
    </span>
  );
}
