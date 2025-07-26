/**
 * Homepage
 */
import { cookies } from 'next/headers';

import DashboardSidebar from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default async function Home() {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  return (
    <div>
      <SidebarProvider defaultOpen={defaultOpen}>
        <DashboardSidebar />
        <main>
        </main>
      </SidebarProvider>
    </div>
  );
}
