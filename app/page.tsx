/**
 * Homepage
 */
'use client';

import ConnectionProvider from '@/components/dashboard/ConnectionProvider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { PilotModeProvider } from '@/components/pilot/usePilotMode';

export default function Home() {
  return (
    <ConnectionProvider>
      <SidebarProvider defaultOpen={false}>
        <PilotModeProvider>
          <DashboardLayout />
          <Toaster richColors />
        </PilotModeProvider>
      </SidebarProvider>
    </ConnectionProvider>
  );
}
