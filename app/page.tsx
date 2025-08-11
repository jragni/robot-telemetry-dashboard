/**
 * Homepage
 */
import { cookies } from 'next/headers';

import ConnectionProvider from '@/components/dashboard/ConnectionProvider';

import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from '@/components/ui/sonner';

import ControlSection from '@/components/controlsection';
import DashboardSidebar from "@/components/sidebar";
import TopicSection from '@/components/topicsection';

export default async function Home() {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <ConnectionProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <DashboardSidebar />
        <main>
          <ControlSection />
          <TopicSection />
        </main>
        <Toaster richColors />
      </SidebarProvider>
    </ConnectionProvider>
  );
}
