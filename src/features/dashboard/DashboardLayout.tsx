import { useState } from 'react';

import ControlPanel from '../control/ControlPanel';
import PilotModeLayout from '../pilot-mode/PilotModeLayout';
import IMUCard from '../telemetry/imu/IMUCard';
import LidarCard from '../telemetry/lidar/LidarCard';
import TopicsList from '../telemetry/topics/TopicsList';
import VideoPlaceholder from '../video/VideoPlaceholder';

import Header from './Header';

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

        {/* Normal Mode - Grid layout */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            !isPilotMode
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <main className="container mx-auto p-3 h-full overflow-auto lg:overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:h-full">
              <div className="flex flex-col lg:col-span-2 gap-3">
                <div className="lg:flex-1 lg:min-h-0">
                  <VideoPlaceholder />
                </div>
                <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ControlPanel
                    onTogglePilotMode={() => setIsPilotMode(true)}
                  />
                  <IMUCard />
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:overflow-auto">
                <LidarCard />
                <TopicsList />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
