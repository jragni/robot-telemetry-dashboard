'use client';

import { useTheme } from 'next-themes';
import { Bot, Moon, Sun, PanelLeft } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
} from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import useMounted from '@/hooks/useMounted';
import { useConnection } from '../dashboard/ConnectionProvider'; // TODO this will be moved

import AddConnectionDialog from './AddConnectionDialog';
import ConnectionsList from './ConnectionsList';

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
  const { theme, setTheme } = useTheme();
  const {
    connections,
    disconnect,
    removeConnection,
    reconnect,
    selectedConnectionId,
    setSelectedConnectionId,
  } = useConnection();
  const { open } = useSidebar();
  const isMounted = useMounted();

  const connectionsArray = Object.values(connections);

  return (
    <>
      {/* Full Sidebar */}
      <Sidebar className={open ? 'block' : 'hidden'} data-testid="sidebar" side="left" variant="sidebar">
        <SidebarHeader>
          <div className="flex gap-2 justify-center items-center px-1 py-1">
            <Bot className="h-8 w-8"/>
            <h2 className="font-semibold text-md">Telemetry Dashboard</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs sm:text-sm">Active Connections</SidebarGroupLabel>
            <SidebarGroupContent className="flex flex-col justify-center">
              <div className="flex my-2 p-2 justify-between">
                <p className="font-bold text-xs sm:text-sm">Connected Data Sources: </p>
                <Badge
                  className="h-5 min-w-5 rounded-full font-mono tabular-nums"
                  variant="default"
                >
                  {connectionsArray.filter(({ status }) => status === 'connected').length}
                </Badge>
              </div>
              <ConnectionsList
                connections={connectionsArray}
                disconnect={disconnect}
                reconnect={reconnect}
                removeConnection={removeConnection}
                selectedConnectionId={selectedConnectionId}
                setSelectedConnectionId={setSelectedConnectionId}
              />
              <AddConnectionDialog />
            </SidebarGroupContent>
            <SidebarSeparator className="my-4" />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center justify-center gap-2">
            {isMounted && (
              <>
                <Label htmlFor="theme-switch">Theme</Label>
                {theme === 'dark' && <Moon className="h-4 w-4" />}
                {theme === 'light' && <Sun className="h-4 w-4" />}
                <Switch
                  aria-label="Choose theme"
                  checked={theme === 'dark'}
                  className="h-4 w-10"
                  id="theme-switch"
                  onCheckedChange={(isChecked)=> setTheme(isChecked ? 'dark' : 'light')}
                />
              </>
            )}
          </div>
          <p className="text-xs text-center">
            jragni. Rights reserved {`${(new Date()).getFullYear()}`}
          </p>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      {/* Collapsed Sidebar Column */}
      {!open && (
        <div className="fixed left-0 top-0 z-40 flex flex-col h-dvh bg-sidebar border-r border-sidebar-border w-16 transition-all duration-200 ease-in-out overflow-hidden">
          {/* Header */}
          <div className="h-16 flex items-center justify-center border-b border-sidebar-border">
            <SidebarTrigger className="h-10 w-10 hover:bg-sidebar-accent transition-all duration-200 ease-in-out rounded-lg group">
              <div className="group-hover:scale-110 transition-transform duration-200">
                <PanelLeft className="h-4 w-4" />
              </div>
            </SidebarTrigger>
          </div>
          {/* Content */}
          <div className="flex-1 flex flex-col items-center py-6 space-y-6 min-h-0">
            {/* Bot Icon with tooltip-like behavior */}
            <div className="group relative flex items-center justify-center h-10 w-10 bg-sidebar-accent rounded-lg hover:bg-sidebar-primary/10 transition-all duration-200 ease-in-out hover:scale-105">
              <Bot className="h-5 w-5 text-sidebar-primary transition-colors duration-200" />
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border shadow-lg">
                Telemetry Dashboard
              </div>
            </div>
            {/* Connection Count with status indicator */}
            <div className="group relative flex items-center justify-center">
              <Badge
                variant="default"
                className={`h-6 w-6 rounded-full font-mono text-xs p-0 flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${
                  connectionsArray.filter(({ status }) => status === 'connected').length > 0
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-400 hover:bg-gray-500'
                }`}
              >
                {connectionsArray.filter(({ status }) => status === 'connected').length}
              </Badge>
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border shadow-lg">
                {connectionsArray.filter(({ status }) => status === 'connected').length} Connected
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="h-16 flex items-center justify-center border-t border-sidebar-border mt-auto">
            {isMounted && (
              <div className="group relative flex items-center justify-center">
                <button
                  aria-label="Toggle theme"
                  className="h-10 w-10 flex items-center justify-center hover:bg-sidebar-accent rounded-lg transition-all duration-200 ease-in-out hover:scale-105"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? (
                    <Moon className="h-4 w-4 text-sidebar-foreground transition-transform duration-200 hover:rotate-12" />
                  ) : (
                    <Sun className="h-4 w-4 text-sidebar-foreground transition-transform duration-200 hover:rotate-12" />
                  )}
                </button>
                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border shadow-lg">
                  Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}