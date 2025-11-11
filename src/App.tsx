// App.tsx - Main application entry point

import { ControlProvider } from './contexts/control/ControlContext';
import { LidarZoomProvider } from './contexts/lidar-zoom/LidarZoomContext';
import { RosProvider } from './contexts/ros/RosContext';
import { WebRTCProvider } from './contexts/webrtc/WebRTCContext';
import DashboardLayout from './layouts/DashboardLayout';

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
