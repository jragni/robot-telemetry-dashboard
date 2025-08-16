'use client';

import { useConnection } from '@/components/dashboard/ConnectionProvider';

import CameraVisualization from './CameraVizualization';

export default function SensorSection(): React.ReactNode {
  const { selectedConnection } = useConnection();

  if (!selectedConnection || selectedConnection.status !== 'connected') {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-muted-foreground">No connection available</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Camera Feed - Full space on left side */}
      <div className="h-full">
        <CameraVisualization />
      </div>
    </div>
  );
}