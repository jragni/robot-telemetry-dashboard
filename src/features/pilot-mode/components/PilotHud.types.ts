import type { PilotHudData } from '../pilot-mode.types';

export interface HudPanelProps {
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

export interface ConnectionBadgesProps {
  rosConnectionState: PilotHudData['rosConnectionState'];
  webrtcConnectionState: PilotHudData['webrtcConnectionState'];
}

export interface VelocityReadoutProps {
  linearVelocity: number;
  angularVelocity: number;
}

export interface HeadingIndicatorProps {
  heading: number;
}

export interface BatteryIndicatorProps {
  batteryPercentage: number;
}

export interface PilotHudProps {
  hudData: PilotHudData;
  onExit: () => void;
}
