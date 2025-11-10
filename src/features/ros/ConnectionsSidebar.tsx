/**
 * ConnectionsSidebar
 *
 * Sidebar for managing robot connections.
 * Displays list of saved robots and allows adding new ones.
 */

import { AlertTriangle, Plus, Power, PowerOff, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { AddRobotModal } from './AddRobotModal';
import type { RobotConnection } from './definitions';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface ConnectionsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  robots: RobotConnection[];
  activeRobotId: string | null;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
  onAddRobot: (name: string, url: string) => void;
  onSelectRobot: (robotId: string) => void;
  onDeleteRobot: (robotId: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ConnectionsSidebar({
  isOpen,
  onClose,
  robots,
  activeRobotId,
  connectionState,
  onAddRobot,
  onSelectRobot,
  onDeleteRobot,
  onConnect,
  onDisconnect,
}: ConnectionsSidebarProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [robotToDelete, setRobotToDelete] = useState<RobotConnection | null>(
    null
  );

  const activeRobot = robots.find((r) => r.id === activeRobotId);
  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';

  const handleConfirmDelete = () => {
    if (robotToDelete) {
      onDeleteRobot(robotToDelete.id);
      setRobotToDelete(null);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-80 sm:w-96 flex flex-col p-6">
          <SheetHeader className="px-0">
            <SheetTitle className="text-sm font-mono font-semibold tracking-wider">
              ROBOT CONNECTIONS
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col flex-1 overflow-hidden pt-6 -mx-6 px-6">
            {/* Active Connection Status */}
            {activeRobot && (
              <div className="p-4 mb-4 border-2 border-primary/20 rounded-sm bg-accent/50 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono font-semibold text-foreground truncate">
                      {activeRobot.name}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground truncate">
                      {activeRobot.url}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isConnected
                          ? 'bg-green-500 animate-pulse'
                          : isConnecting
                            ? 'bg-yellow-500 animate-pulse'
                            : 'bg-muted-foreground/30'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-mono font-semibold">
                      {isConnected
                        ? 'CONNECTED'
                        : isConnecting
                          ? 'CONNECTING'
                          : 'DISCONNECTED'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isConnected ? (
                    <Button
                      onClick={onDisconnect}
                      variant="destructive"
                      size="sm"
                      className="flex-1 h-8"
                    >
                      <PowerOff className="w-3 h-3 mr-1.5" />
                      DISCONNECT
                    </Button>
                  ) : (
                    <Button
                      onClick={onConnect}
                      disabled={isConnecting}
                      size="sm"
                      className="flex-1 h-8"
                    >
                      <Power className="w-3 h-3 mr-1.5" />
                      {isConnecting ? 'CONNECTING...' : 'CONNECT'}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Robots List */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono font-semibold text-muted-foreground">
                  SAVED ROBOTS
                </h3>
                <span className="text-xs font-mono text-muted-foreground">
                  {robots.length}
                </span>
              </div>

              {robots.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs font-mono text-muted-foreground mb-4">
                    No robots added yet
                  </p>
                  <Button
                    onClick={() => setShowAddModal(true)}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-3 h-3 mr-1.5" />
                    ADD YOUR FIRST ROBOT
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {robots.map((robot) => (
                    <div
                      key={robot.id}
                      className={`group relative p-3 border rounded-sm transition-colors cursor-pointer ${
                        robot.id === activeRobotId
                          ? 'border-primary bg-accent border-2'
                          : 'border-border hover:bg-accent/30'
                      }`}
                      onClick={() => onSelectRobot(robot.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectRobot(robot.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono font-semibold text-foreground truncate">
                            {robot.name}
                          </p>
                          <p className="text-xs font-mono text-muted-foreground truncate">
                            {robot.url}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRobotToDelete(robot);
                          }}
                          className="h-6 w-6 opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0"
                          aria-label={`Delete ${robot.name}`}
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Robot Button */}
            {robots.length > 0 && (
              <div className="pt-4 mt-4 border-t border-border">
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  ADD ROBOT
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Robot Modal */}
      <AddRobotModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={onAddRobot}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!robotToDelete}
        onOpenChange={() => setRobotToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-mono">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              DELETE ROBOT CONNECTION
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">
                {robotToDelete?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono">CANCEL</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 font-mono"
            >
              DELETE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
