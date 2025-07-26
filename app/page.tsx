/**
 * Homepage
 */
import { cookies } from 'next/headers';

import DashboardSidebar from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function Home() {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <div>
      <SidebarProvider defaultOpen={defaultOpen}>
        <DashboardSidebar />
        <main className="pl-2">
        </main>
      </SidebarProvider>
    </div>
  );
}
