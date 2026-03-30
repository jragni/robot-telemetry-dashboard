import { Camera } from 'lucide-react';

/**
 * Renders a mock camera feed placeholder with scanline effect and resolution info.
 */
export function MockCamera() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 w-full h-full bg-surface-base rounded-sm">
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,oklch(0.16_0.02_260)_3px,oklch(0.16_0.02_260)_4px)] opacity-20" />
        <div className="flex flex-col items-center gap-2 z-10">
          <Camera className="size-8 text-text-muted opacity-30" />
          <span className="font-mono text-xs text-text-muted">
            /camera/image_raw
          </span>
          <span className="font-mono text-xs text-accent">640×480 @ 30fps</span>
        </div>
      </div>
    </div>
  );
}
