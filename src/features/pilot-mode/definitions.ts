// Pilot mode types, interfaces, and enums

export interface PilotConnectionStatusProps {
  isConnected: boolean;
}

export interface PilotModeLayoutProps {
  isConnected: boolean;
  onExitPilotMode: () => void;
}
