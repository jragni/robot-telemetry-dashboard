/**
 * Dashboard Sidebar
 */

'use client';

import { Bot } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

export default function DashboardSidebar() {
  const { open } = useSidebar();

  return (
    <>
      <Sidebar side="left" variant="sidebar">
        <SidebarHeader>
          <div className="flex gap-2 justify-center items-center px-1 py-1">
            <Bot className="h-8 w-8"/>
            <h2 className="font-semibold text-md">Telemetry Dashboard</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
        </SidebarContent>
        <SidebarFooter className="items-center justify-center">
          <p className="text-xs">
            jragni. Rights reserved {`${(new Date()).getFullYear()}`}
          </p>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarTrigger className="py-6" hidden={open} />
    </>
  );
}