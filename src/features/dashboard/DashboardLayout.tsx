import { useState } from 'react';

import ControlPanel from '../control/ControlPanel';
import PilotModeLayout from '../pilot-mode/PilotModeLayout';
import { ConnectionsSidebar } from '../ros/ConnectionsSidebar';
import { useRosContext } from '../ros/RosContext';
import IMUCard from '../telemetry/imu/IMUCard';
import LidarCard from '../telemetry/lidar/LidarCard';
import TopicsList from '../telemetry/topics/TopicsList';
import WebRTCVideo from '../video/WebRTCVideo';

import Header from './Header';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

function DashboardLayout() {
  const [isPilotMode, setIsPilotMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const {
    robots,
    activeRobotId,
    connectionState,
    addRobot,
    selectRobot,
    deleteRobot,
    connect,
    disconnect,
  } = useRosContext();

  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      {!isPilotMode && (
        <Header onToggleSidebar={() => setShowSidebar(!showSidebar)} />
      )}

      <ConnectionsSidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        robots={robots}
        activeRobotId={activeRobotId}
        connectionState={connectionState}
        onAddRobot={addRobot}
        onSelectRobot={selectRobot}
        onDeleteRobot={deleteRobot}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      <div className="flex-1 relative overflow-hidden">
        {/* Pilot Mode */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isPilotMode
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <PilotModeLayout onExitPilotMode={() => setIsPilotMode(false)} />
        </div>

        {/* Normal Mode - Resizable layout */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            !isPilotMode
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <main className="container mx-auto p-3 h-full overflow-hidden">
            {/* Mobile: Stack layout */}
            <div className="lg:hidden flex flex-col gap-3 h-full overflow-auto">
              <div className="min-h-[300px] flex-shrink-0">
                <WebRTCVideo />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-shrink-0">
                <div className="min-h-[250px]">
                  <ControlPanel
                    onTogglePilotMode={() => setIsPilotMode(true)}
                  />
                </div>
                <div className="min-h-[250px]">
                  <IMUCard />
                </div>
              </div>
              <div className="min-h-[350px] flex-shrink-0">
                <LidarCard />
              </div>
              <div className="min-h-[300px] flex-shrink-0">
                <TopicsList />
              </div>
            </div>

            {/* Desktop: Resizable layout */}
            <div className="hidden lg:block h-full">
              <ResizablePanelGroup direction="horizontal">
                {/* Left Section - Video + Controls */}
                <ResizablePanel defaultSize={66} minSize={30}>
                  <ResizablePanelGroup direction="vertical">
                    {/* Video Feed */}
                    <ResizablePanel defaultSize={65} minSize={20}>
                      <div className="h-full pr-1.5">
                        <WebRTCVideo />
                      </div>
                    </ResizablePanel>

                    <ResizableHandle />

                    {/* Control Panel + IMU Card */}
                    <ResizablePanel defaultSize={35} minSize={15}>
                      <ResizablePanelGroup direction="horizontal">
                        {/* Control Panel */}
                        <ResizablePanel defaultSize={50} minSize={30}>
                          <div className="h-full pr-1.5 pt-1.5">
                            <ControlPanel
                              onTogglePilotMode={() => setIsPilotMode(true)}
                            />
                          </div>
                        </ResizablePanel>

                        <ResizableHandle />

                        {/* IMU Card */}
                        <ResizablePanel defaultSize={50} minSize={30}>
                          <div className="h-full pr-1.5 pt-1.5">
                            <IMUCard />
                          </div>
                        </ResizablePanel>
                      </ResizablePanelGroup>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>

                <ResizableHandle />

                {/* Right Section - Lidar + Topics */}
                <ResizablePanel defaultSize={34} minSize={20}>
                  <ResizablePanelGroup direction="vertical">
                    {/* Lidar Card */}
                    <ResizablePanel defaultSize={74} minSize={20}>
                      <div className="h-full pl-1.5">
                        <LidarCard />
                      </div>
                    </ResizablePanel>

                    <ResizableHandle />

                    {/* Topics List */}
                    <ResizablePanel defaultSize={40} minSize={15}>
                      <div className="h-full pl-1.5 pt-1.5 overflow-auto">
                        <TopicsList />
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
