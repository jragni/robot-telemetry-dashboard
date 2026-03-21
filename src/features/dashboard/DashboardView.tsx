import { ModeSwitcher } from './components/ModeSwitcher/ModeSwitcher';
import { DashboardMode } from './modes/DashboardMode/DashboardMode';
import { EngineerMode } from './modes/EngineerMode/EngineerMode';
import { PilotMode } from './modes/PilotMode/PilotMode';
import { useModeStore } from './stores/modeStore';

import { Show } from '@/shared/components/Show';
import { useMobile } from '@/shared/hooks/use-mobile';

export function DashboardView() {
  const currentMode = useModeStore((s) => s.currentMode);
  const isMobile = useMobile();

  // Fix 2: engineer guard — fall back to dashboard on mobile
  const activeMode =
    isMobile && currentMode === 'engineer' ? 'dashboard' : currentMode;

  return (
    <div data-testid="dashboard-mode" className="flex h-full flex-col">
      {/* Fix 5: hide mode switcher header on mobile */}
      <Show when={!isMobile}>
        <div
          data-testid="mode-switcher-header"
          className="flex shrink-0 items-center border-b border-slate-700 bg-slate-900 px-3 py-2"
        >
          <ModeSwitcher />
        </div>
      </Show>
      <div className="min-h-0 flex-1">
        {activeMode === 'dashboard' && <DashboardMode />}
        {activeMode === 'pilot' && <PilotMode isMobile={isMobile} />}
        {activeMode === 'engineer' && <EngineerMode />}
      </div>
    </div>
  );
}
