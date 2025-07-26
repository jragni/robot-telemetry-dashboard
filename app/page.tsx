/**
 * Homepage
 */

import DashboardSidebar from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <div>
      <SidebarProvider defaultOpen>
        <DashboardSidebar />
        <main>
          <SidebarTrigger />
        </main>
      </SidebarProvider>
    </div>
  );
}
