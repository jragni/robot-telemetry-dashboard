"use client";

import { useTheme } from 'next-themes';
import { Bot, LoaderPinwheel, Moon, Sun } from "lucide-react";

import { Badge } from '@/components/ui/badge'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Switch } from '@/components/ui/switch';
import useMounted from '@/hooks/useMounted';

import AddConnectionDialog from "./AddConnectionDialog";

/**
 * Dashboard Sidebar
 * 
 * @description
 * Sidebar component that shows the following:
 * - How many devices are connected
 * - An option to add devices/robots
 * 
 */
export default function DashboardSidebar() {
  const { theme, setTheme } = useTheme()
  const { open } = useSidebar();
  const isMounted = useMounted();

  const connectionCount = 0; // TODO: add state or derived variable for this

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
          {/* Active Connections */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-md">
              Active Connections
            </SidebarGroupLabel>
            <SidebarGroupContent
              className="flex flex-col justify-center"
            >
              <div className="flex my-2 p-2 justify-between">
                <p>Connected Data Sources: </p>
                <Badge
                  className="h-5 min-w-5 rounded-full font-mono tabular-nums"
                  variant="default"
                >
                  {connectionCount}
                </Badge>
              </div>
              {/* TODO: Add list of connected devices */}
              <AddConnectionDialog />
            </SidebarGroupContent>
          <SidebarSeparator className="my-4" />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center justify-center gap-2">
            {isMounted && (
              <div className="flex items-center justify-center gap-2">
                {theme === 'dark' && <Moon className="h-4 w-4" />}
                {theme === 'light' && <Sun className="h-4 w-4" />}
                <Switch
                  id="theme-switch"
                  aria-label="Choose light theme"
                  checked={theme === 'dark'}
                  onCheckedChange={(isChecked)=> setTheme(isChecked ? 'dark' : 'light')}
                />
              </div>
            )}
          </div>
          <p className="text-xs text-center">
            jragni. Rights reserved {`${(new Date()).getFullYear()}`}
          </p>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarTrigger className="py-6" hidden={open} />
    </>
  );
}