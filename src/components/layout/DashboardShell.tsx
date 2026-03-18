import { Outlet } from 'react-router';

import { DisconnectGuard } from './DisconnectGuard';
import { Header } from './Header';
import { SidebarToggle } from './SidebarToggle';

import { Show } from '@/components/shared/Show';
import { ConnectionsSidebar } from '@/features/connections/components/ConnectionsSidebar';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui/ui.store';

// ---------------------------------------------------------------------------
// DashboardShell
// ---------------------------------------------------------------------------

/**
 * Root layout shell for all non-pilot routes.
 *
 * Structure:
 *   ┌────────────────────────────────────────┐
 *   │ Header (h-12, full width)              │
 *   ├──┬───────┬─────────────────────────────┤
 *   │☰ │Sidebar│ <Outlet /> (main content)   │
 *   │  │(w-64, │                             │
 *   │  │collap)│                             │
 *   └──┴───────┴─────────────────────────────┘
 *
 * The sidebar toggle (hamburger) sits at the left edge of the content area,
 * between the sidebar and main content. It is always visible — even when the
 * sidebar is collapsed — so the user can always re-open it.
 *
 * Responsive behaviour:
 *   - Mobile (<md): sidebar overlays as a drawer, toggle always visible
 *   - Desktop (≥md): sidebar pushes content, toggle always visible
 */
export function DashboardShell() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Disconnect safety monitor — zero UI */}
      <DisconnectGuard />

      {/* Header */}
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* ---------------------------------------------------------------- */}
        {/* Sidebar                                                           */}
        {/* ---------------------------------------------------------------- */}

        {/* Mobile overlay backdrop */}
        <Show when={sidebarOpen}>
          <div
            className="fixed inset-0 z-20 bg-black/40 md:hidden"
            aria-hidden="true"
            onClick={() => useUIStore.getState().setSidebarOpen(false)}
          />
        </Show>

        <aside
          aria-label="Connections sidebar"
          className={cn(
            // Base: fixed on mobile, static on desktop
            'fixed md:relative z-20 md:z-auto',
            // Height
            'top-12 md:top-auto h-[calc(100vh-3rem)] md:h-auto',
            // Sidebar-specific background token
            'shrink-0 border-r border-sidebar-border bg-sidebar',
            // Width + slide transition — collapse to 0 width on desktop when closed
            'overflow-hidden transition-all duration-200 ease-in-out',
            sidebarOpen
              ? 'w-64 translate-x-0'
              : 'w-0 -translate-x-full md:translate-x-0 md:border-r-0'
          )}
        >
          <ConnectionsSidebar />
        </aside>

        {/* ---------------------------------------------------------------- */}
        {/* Sidebar toggle strip                                              */}
        {/* ---------------------------------------------------------------- */}
        <SidebarToggle open={sidebarOpen} />

        {/* ---------------------------------------------------------------- */}
        {/* Main content                                                      */}
        {/* ---------------------------------------------------------------- */}
        <main
          className={cn(
            'flex flex-1 flex-col overflow-auto',
            // On desktop push content right when sidebar is open
            'transition-all duration-200 ease-in-out'
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
