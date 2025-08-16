'use client';

import { useConnection } from '@/components/dashboard/ConnectionProvider';

import CameraVisualization from './CameraVizualization';

export default function SensorSection(): React.ReactNode {
  const { selectedConnection } = useConnection();

  if (!selectedConnection || selectedConnection.status !== 'connected') {
    return (
      <div className="h-full bg-gray-800 border border-gray-600 rounded flex items-center justify-center text-gray-400">
        <p className="text-sm">Camera: No connection</p>
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