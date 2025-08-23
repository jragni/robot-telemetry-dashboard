'use client';

import { usePilotMode } from './usePilotMode';
import { useConnection } from '@/components/dashboard/ConnectionProvider';
import PilotDesktopView from './PilotDesktopView';
import PilotMobileView from './PilotMobileView';
import PilotModeCamera from './PilotModeCamera';

export default function PilotMode() {
  const { exitPilotMode, isPilotMode, orientation } = usePilotMode();
  const { selectedConnection } = useConnection();

  if (!isPilotMode) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-black mobile-fullscreen ${orientation === 'landscape' ? 'mobile-landscape-layout' : ''}`}
      data-testid="pilot-mode"
    >
      {/* Fullscreen camera background */}
      <PilotModeCamera />
      <PilotDesktopView selectedConnection={selectedConnection} />
      <PilotMobileView
        exitPilotMode={exitPilotMode}
        orientation={orientation}
        selectedConnection={selectedConnection}
      />
    </div>
  );
}