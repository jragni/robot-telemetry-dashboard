interface PilotConnectionStatusProps {
  isConnected: boolean;
}

function PilotConnectionStatus({ isConnected }: PilotConnectionStatusProps) {
  return (
    <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 bg-card/80 backdrop-blur-md border border-border/50 rounded-sm px-3 py-2">
      <div className="flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}
        />
        <span className="text-xs font-mono text-foreground">
          {isConnected ? 'ONLINE' : 'OFFLINE'}
        </span>
      </div>
    </div>
  );
}

export default PilotConnectionStatus;
