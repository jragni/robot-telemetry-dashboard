import { useEffect } from 'react';

import type { PilotModeLayoutProps } from './definitions';
import PilotModeLayoutDesktop from './layout/PilotModeLayoutDesktop';
import PilotModeLayoutMobile from './layout/PilotModeLayoutMobile';

function PilotModeLayout({ onExitPilotMode }: PilotModeLayoutProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onExitPilotMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExitPilotMode]);

  return (
    <main className="h-full w-full relative overflow-hidden">
      <PilotModeLayoutMobile onExitPilotMode={onExitPilotMode} />
      <PilotModeLayoutDesktop onExitPilotMode={onExitPilotMode} />
    </main>
  );
}

export default PilotModeLayout;
