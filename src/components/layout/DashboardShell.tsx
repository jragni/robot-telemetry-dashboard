import { Outlet } from 'react-router';

export function DashboardShell() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="h-14 shrink-0 border-b border-border bg-card px-6 flex items-center">
        <span className="text-sm font-semibold tracking-widest text-primary uppercase">
          Robot Telemetry
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-sidebar-border bg-sidebar" />

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
