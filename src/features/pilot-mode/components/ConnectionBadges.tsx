import { HudPanel } from './HudPanel';
import type { ConnectionBadgesProps } from './PilotHud.types';

import { StatusIndicator } from '@/components/shared/StatusIndicator';

export function ConnectionBadges({
  rosConnectionState,
  webrtcConnectionState,
}: ConnectionBadgesProps) {
  return (
    <HudPanel
      data-testid="hud-connection-badges"
      className="flex flex-col gap-1.5"
    >
      <StatusIndicator state={rosConnectionState} label="ROS" />
      <StatusIndicator state={webrtcConnectionState} label="VIDEO" />
    </HudPanel>
  );
}
