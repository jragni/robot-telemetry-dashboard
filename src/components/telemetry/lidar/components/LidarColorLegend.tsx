export function LidarColorLegend() {
  return (
    <div className="absolute bottom-2 right-2 flex items-center gap-2 text-[10px] font-mono">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-muted-foreground">Near</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-yellow-500" />
        <span className="text-muted-foreground">Mid</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-muted-foreground">Far</span>
      </div>
    </div>
  );
}
