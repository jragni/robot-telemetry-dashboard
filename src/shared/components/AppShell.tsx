import { Outlet } from 'react-router';

import { MinimalHeader } from './MinimalHeader';
import { Show } from './Show';
import { Sidebar } from './Sidebar/Sidebar';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useUIStore } from '@/shared/stores/ui/ui.store';

// Sidebar panel constraints (percentages of viewport)
// minSize ~180px at 1280px viewport ≈ 14%
// defaultSize 256px ≈ 20%
// maxSize 400px ≈ 31%
const SIDEBAR_MIN = 14;
const SIDEBAR_DEFAULT = 20;
const SIDEBAR_MAX = 31;

export function AppShell() {
  const immersiveMode = useUIStore((s) => s.immersiveMode);

  return (
    <div className="flex h-screen flex-col bg-background">
      <Show when={!immersiveMode}>
        <MinimalHeader />
      </Show>

      <div className="flex flex-1 overflow-hidden">
        <Show when={!immersiveMode}>
          <ResizablePanelGroup orientation="horizontal" className="flex-1">
            <ResizablePanel
              defaultSize={SIDEBAR_DEFAULT}
              minSize={SIDEBAR_MIN}
              maxSize={SIDEBAR_MAX}
              className="min-w-0"
            >
              <Sidebar />
            </ResizablePanel>

            <ResizableHandle data-testid="sidebar-resize-handle" withHandle />

            <ResizablePanel className="min-w-0">
              <main className="h-full overflow-y-auto">
                <Outlet />
              </main>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Show>

        <Show when={immersiveMode}>
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </Show>
      </div>
    </div>
  );
}
