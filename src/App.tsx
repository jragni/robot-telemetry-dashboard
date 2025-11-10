// App.tsx - Main application entry point

import { ControlProvider } from './features/control/ControlContext';
import DashboardLayout from './features/dashboard/DashboardLayout';
import { RosProvider } from './features/ros/RosContext';
import { LidarZoomProvider } from './features/telemetry/lidar/LidarZoomContext';

function App() {
  return (
    <RosProvider>
      <ControlProvider>
        <LidarZoomProvider>
          <DashboardLayout />
        </LidarZoomProvider>
      </ControlProvider>
    </RosProvider>
  );
}

export default App;
