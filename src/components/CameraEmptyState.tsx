import { Camera } from 'lucide-react';

import type { CameraEmptyStateProps } from '@/types/CameraEmptyState.types';

/** CameraEmptyState
 * @description Renders a camera placeholder with an icon and status message.
 *  Used by both PilotCamera and CameraPanel when no stream is active.
 *  Parent controls layout wrapping.
 * @param message - Status text to display below the icon.
 * @param label - Optional secondary label (e.g., topic name).
 * @param variant - Size variant: compact (workspace panels) or hero (pilot full-bleed).
 */
export function CameraEmptyState({ label, message, variant = 'compact' }: CameraEmptyStateProps) {
  const iconClass = variant === 'hero' ? 'size-12 text-text-muted' : 'size-8 text-text-muted opacity-30';

  return (
    <div className="flex flex-col items-center gap-2">
      <Camera className={iconClass} aria-hidden="true" />
      <span className="font-mono text-sm text-text-muted">{message}</span>
      {label ? <span className="font-mono text-xs text-text-secondary">{label}</span> : null}
    </div>
  );
}
