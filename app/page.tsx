/**
 * Homepage
 */
import { cookies } from 'next/headers';

import ConnectionProvider from '@/components/dashboard/ConnectionProvider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default async function Home() {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

  return (
    <ConnectionProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <DashboardLayout />
        <Toaster richColors />
      </SidebarProvider>
    </ConnectionProvider>
  );
}
