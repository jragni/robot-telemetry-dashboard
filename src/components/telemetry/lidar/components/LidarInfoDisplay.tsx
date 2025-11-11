interface LidarInfoDisplayProps {
  viewRange: number;
  maxRange: number;
  compact?: boolean;
}

export function LidarInfoDisplay({
  viewRange,
  maxRange,
  compact = false,
}: LidarInfoDisplayProps) {
  const className = compact
    ? 'absolute bottom-2 left-2 text-xs font-mono text-muted-foreground bg-card/90 backdrop-blur-sm px-2 py-1 rounded-sm'
    : 'absolute bottom-2 left-2 text-xs font-mono text-muted-foreground';

  return (
    <div className={className}>
      View: {viewRange.toFixed(1)}m | Max: {maxRange.toFixed(1)}m
    </div>
  );
}
