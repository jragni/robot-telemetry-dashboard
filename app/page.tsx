/**
 * Homepage
 */
import { cookies } from 'next/headers';

import ConnectionProvider from '@/components/dashboard/ConnectionProvider';
import DashboardSidebar from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function Home() {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <ConnectionProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <DashboardSidebar />
          <main></main>
      </SidebarProvider>
    </ConnectionProvider>
  );
}
