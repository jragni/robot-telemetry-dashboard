interface IMUStatusMessageProps {
  isConnected: boolean;
  loading: boolean;
  hasData: boolean;
}

export function IMUStatusMessage({
  isConnected,
  loading,
  hasData,
}: IMUStatusMessageProps) {
  if (!isConnected) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xs font-mono text-muted-foreground text-center">
          Not connected to robot
        </p>
      </div>
    );
  }

  if (loading || !hasData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xs font-mono text-muted-foreground">
          Waiting for IMU data...
        </p>
      </div>
    );
  }

  return null;
}
