import { useState } from 'react';

import ControlPanel from '../control/ControlPanel';
import PilotModeLayout from '../pilot-mode/PilotModeLayout';
import IMUCard from '../telemetry/imu/IMUCard';
import LidarCard from '../telemetry/lidar/LidarCard';
import TopicsList from '../telemetry/topics/TopicsList';
import VideoPlaceholder from '../video/VideoPlaceholder';

import Header from './Header';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

function DashboardLayout() {
  // TODO: Connect to actual ROS connection status
  const [isConnected] = useState(false);
  const [isPilotMode, setIsPilotMode] = useState(false);

  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      {!isPilotMode && <Header isConnected={isConnected} />}

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
              <VideoPlaceholder />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ControlPanel onTogglePilotMode={() => setIsPilotMode(true)} />
                <IMUCard />
              </div>
              <LidarCard />
              <TopicsList />
            </div>

            {/* Desktop: Resizable layout */}
            <div className="hidden lg:block h-full">
              <ResizablePanelGroup direction="horizontal">
                {/* Left Section - Video + Controls */}
                <ResizablePanel defaultSize={66} minSize={40}>
                  <ResizablePanelGroup direction="vertical">
                    {/* Video Feed */}
                    <ResizablePanel defaultSize={65} minSize={30}>
                      <div className="h-full pr-1.5">
                        <VideoPlaceholder />
                      </div>
                    </ResizablePanel>

                    <ResizableHandle />

                    {/* Control Panel + IMU Card */}
                    <ResizablePanel defaultSize={35} minSize={20}>
                      <ResizablePanelGroup direction="horizontal">
                        {/* Control Panel */}
                        <ResizablePanel defaultSize={50} minSize={35}>
                          <div className="h-full pr-1.5 pt-1.5">
                            <ControlPanel
                              onTogglePilotMode={() => setIsPilotMode(true)}
                            />
                          </div>
                        </ResizablePanel>

                        <ResizableHandle />

                        {/* IMU Card */}
                        <ResizablePanel defaultSize={50} minSize={35}>
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
                <ResizablePanel defaultSize={34} minSize={25}>
                  <ResizablePanelGroup direction="vertical">
                    {/* Lidar Card */}
                    <ResizablePanel defaultSize={74} minSize={30}>
                      <div className="h-full pl-1.5">
                        <LidarCard />
                      </div>
                    </ResizablePanel>

                    <ResizableHandle />

                    {/* Topics List */}
                    <ResizablePanel defaultSize={40} minSize={20}>
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
