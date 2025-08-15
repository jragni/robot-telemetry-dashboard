/**
 * Homepage
 */
import { cookies } from 'next/headers';

import ConnectionProvider from '@/components/dashboard/ConnectionProvider';

import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from '@/components/ui/sonner';

import ControlSection from '@/components/controlsection';
import DashboardSidebar from "@/components/sidebar";
import SensorSection from '@/components/sensorsection';
import TopicSection from '@/components/topicsection';

export default async function Home() {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <ConnectionProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <div className="flex min-h-screen w-full -ml-0">
          <DashboardSidebar />
          <main className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto">
              <div className="p-4 space-y-6 max-w-7xl mx-auto">
                <ControlSection />
                <SensorSection />
                <TopicSection />
              </div>
            </div>
          </main>
        </div>
        <Toaster richColors />
      </SidebarProvider>
    </ConnectionProvider>
  );
}
