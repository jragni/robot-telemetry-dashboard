function VideoPlaceholder() {
  return (
    <div className="relative min-h-[300px] w-full aspect-video lg:aspect-auto lg:h-full bg-card border border-border rounded-sm overflow-hidden">
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-muted-foreground">
          <svg
            className="w-20 h-20 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-muted-foreground text-sm font-mono tracking-wider">
          VIDEO FEED OFFLINE
        </p>
        <p className="text-muted-foreground/70 text-xs font-mono mt-1">
          WebRTC NOT CONNECTED
        </p>
      </div>

      <div className="absolute top-3 left-3">
        <div className="flex items-center gap-2 bg-background/80 px-2 py-1 rounded-sm border border-border">
          <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
          <span className="text-xs font-mono text-muted-foreground">REC</span>
        </div>
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-xs font-mono text-muted-foreground">
        <span>CAM-01</span>
        <span>00:00:00</span>
      </div>
    </div>
  );
}

export default VideoPlaceholder;
