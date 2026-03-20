import { Outlet } from 'react-router';

import { BottomTabBar } from './BottomTabBar';
import { Header } from './Header';
import { Show } from './Show';
import { SidebarToggle } from './SidebarToggle';

import { cn } from '@/lib/utils';
import { useMobile } from '@/shared/hooks/use-mobile';
import { useUIStore } from '@/shared/stores/ui/ui.store';

export function DashboardShell() {
  const isMobile = useMobile();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header isMobile={isMobile} />

      <div className="flex flex-1 overflow-hidden">
        <Show when={!isMobile}>
          <>
            <aside
              className={cn(
                'overflow-y-auto border-r border-border bg-card transition-[width] duration-200',
                sidebarOpen ? 'w-64' : 'w-0'
              )}
              aria-label="Sidebar"
            >
              <Show when={sidebarOpen}>
                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Connections
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    No robots connected
                  </p>
                </div>
              </Show>
            </aside>

            <SidebarToggle isOpen={sidebarOpen} onToggle={toggleSidebar} />
          </>
        </Show>

        <main className={cn('flex-1 overflow-y-auto', isMobile && 'pb-14')}>
          <Outlet />
        </main>
      </div>

      <BottomTabBar isMobile={isMobile} />
    </div>
  );
}
