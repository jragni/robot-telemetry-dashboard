interface LidarStatusMessageProps {
  isConnected: boolean;
  loading: boolean;
  hasData: boolean;
}

export function LidarStatusMessage({
  isConnected,
  loading,
  hasData,
}: LidarStatusMessageProps) {
  if (!isConnected) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-xs font-mono text-muted-foreground text-center">
          Not connected to robot
        </p>
      </div>
    );
  }

  if (loading || !hasData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-xs font-mono text-muted-foreground">
          Waiting for LIDAR data...
        </p>
      </div>
    );
  }

  return null;
}
