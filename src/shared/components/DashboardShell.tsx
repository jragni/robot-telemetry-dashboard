// Superseded by AppShell in Phase 8 IA redesign.
// Kept temporarily for tombstone tests. Will be deleted once all references are migrated.
import { Outlet } from 'react-router';

import { MinimalHeader } from './MinimalHeader';
import { Sidebar } from './Sidebar/Sidebar';

export function DashboardShell() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <MinimalHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
