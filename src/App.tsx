// App.tsx - Main application entry point

import { Toaster } from './components/ui/sonner';
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
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                },
                classNames: {
                  error:
                    'border-2 !border-red-500 !bg-[hsl(var(--background))] !text-[hsl(var(--foreground))]',
                  success:
                    '!bg-[hsl(var(--background))] !text-[hsl(var(--foreground))]',
                  warning:
                    '!bg-[hsl(var(--background))] !text-[hsl(var(--foreground))]',
                  info: '!bg-[hsl(var(--background))] !text-[hsl(var(--foreground))]',
                  description: '!text-[hsl(var(--muted-foreground))]',
                },
              }}
            />
          </LidarZoomProvider>
        </ControlProvider>
      </WebRTCProvider>
    </RosProvider>
  );
}

export default App;
