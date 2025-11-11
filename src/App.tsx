// App.tsx - Main application entry point

import { ControlProvider } from './features/control/ControlContext';
import DashboardLayout from './features/dashboard/DashboardLayout';
import { RosProvider } from './features/ros/RosContext';
import { LidarZoomProvider } from './features/telemetry/lidar/LidarZoomContext';
import { WebRTCProvider } from './features/video/WebRTCContext';

function App() {
  return (
    <RosProvider>
      <WebRTCProvider>
        <ControlProvider>
          <LidarZoomProvider>
            <DashboardLayout />
          </LidarZoomProvider>
        </ControlProvider>
      </WebRTCProvider>
    </RosProvider>
  );
}

export default App;
