import { ModeSwitcher } from './components/ModeSwitcher/ModeSwitcher';
import { DashboardMode } from './modes/DashboardMode/DashboardMode';
import { EngineerMode } from './modes/EngineerMode/EngineerMode';
import { PilotMode } from './modes/PilotMode/PilotMode';
import { useModeStore } from './stores/modeStore';

import { useMobile } from '@/shared/hooks/use-mobile';

export function DashboardView() {
  const currentMode = useModeStore((s) => s.currentMode);
  const isMobile = useMobile();

  return (
    <div data-testid="dashboard-mode" className="flex h-full flex-col">
      <div className="flex shrink-0 items-center border-b border-slate-700 bg-slate-900 px-3 py-2">
        <ModeSwitcher />
      </div>
      <div className="min-h-0 flex-1">
        {currentMode === 'dashboard' && <DashboardMode />}
        {currentMode === 'pilot' && <PilotMode isMobile={isMobile} />}
        {currentMode === 'engineer' && <EngineerMode />}
      </div>
    </div>
  );
}
