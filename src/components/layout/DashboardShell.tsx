import { Outlet } from 'react-router';

import { Header } from './Header';

import { ConnectionsSidebar } from '@/features/connections/components/ConnectionsSidebar';
import { useDisconnectHandler } from '@/features/connections/hooks/useDisconnectHandler';
import { cn } from '@/lib/utils';
import { useConnectionsStore } from '@/stores/connections.store';
import { useUIStore } from '@/stores/ui.store';

// ---------------------------------------------------------------------------
// DisconnectGuard
// ---------------------------------------------------------------------------

/**
 * Invisible component that activates disconnect safety monitoring for the
 * currently active robot. Rendered inside DashboardShell so it is always
 * present while any dashboard view is open.
 */
function DisconnectGuard() {
  const activeRobotId = useConnectionsStore((s) => s.activeRobotId);
  useDisconnectHandler(activeRobotId ?? '');
  return null;
}

// ---------------------------------------------------------------------------
// DashboardShell
// ---------------------------------------------------------------------------

/**
 * Root layout shell for all non-pilot routes.
 *
 * Structure:
 *   ┌────────────────────────────────────────┐
 *   │ Header (h-12, full width)              │
 *   ├──────────┬─────────────────────────────┤
 *   │ Sidebar  │ <Outlet /> (main content)   │
 *   │ (w-64,   │                             │
 *   │ collaps) │                             │
 *   └──────────┴─────────────────────────────┘
 *
 * Responsive behaviour:
 *   - Mobile (<md): sidebar hidden by default, toggled via hamburger in Header
 *   - Desktop (≥md): sidebar visible, collapsible via hamburger
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
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 md:hidden"
            aria-hidden="true"
            onClick={() => useUIStore.getState().setSidebarOpen(false)}
          />
        )}

        <aside
          aria-label="Connections sidebar"
          className={cn(
            // Base: fixed on mobile, static on desktop
            'fixed md:relative z-20 md:z-auto',
            // Height
            'top-12 md:top-auto h-[calc(100vh-3rem)] md:h-auto',
            // Width — always 16rem
            'w-64',
            // Sidebar-specific background token
            'shrink-0 border-r border-sidebar-border bg-sidebar',
            // Slide transition
            'transition-transform duration-200 ease-in-out',
            sidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full md:-translate-x-full'
          )}
        >
          <ConnectionsSidebar />
        </aside>

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
