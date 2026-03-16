import { Outlet } from 'react-router';

export function DashboardShell() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100">
      {/* Header placeholder */}
      <header className="h-14 shrink-0 border-b border-gray-800 bg-surface px-6 flex items-center">
        <span className="text-sm font-semibold tracking-widest text-brand uppercase">
          Robot Telemetry
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar placeholder */}
        <aside className="w-56 shrink-0 border-r border-gray-800 bg-surface" />

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
