/**
 * ConnectionsSidebar
 *
 * Sidebar for managing robot connections.
 * Displays list of saved robots and allows adding new ones.
 */

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { ActiveConnectionStatus } from './ActiveConnectionStatus';
import { AddRobotModal } from './AddRobotModal';
import { DeleteRobotDialog } from './DeleteRobotDialog';
import { RobotList } from './RobotList';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { RobotConnection } from '@/contexts/ros/definitions';

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
              <ActiveConnectionStatus
                activeRobot={activeRobot}
                connectionState={connectionState}
                onConnect={onConnect}
                onDisconnect={onDisconnect}
              />
            )}

            {/* Robots List */}
            <RobotList
              robots={robots}
              activeRobotId={activeRobotId}
              onSelectRobot={onSelectRobot}
              onDeleteRobot={setRobotToDelete}
              onAddRobot={() => setShowAddModal(true)}
            />

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
      <DeleteRobotDialog
        robot={robotToDelete}
        onClose={() => setRobotToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
