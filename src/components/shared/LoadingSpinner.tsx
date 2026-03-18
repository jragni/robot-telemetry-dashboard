import type { LoadingSpinnerProps } from './LoadingSpinner.types';
import { spinnerVariants } from './LoadingSpinner.variants';

import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LoadingSpinner({ size, className }: LoadingSpinnerProps) {
  return (
    <svg
      className={cn(spinnerVariants({ size }), className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      {/* Background track */}
      <circle cx={12} cy={12} r={10} className="opacity-20" />
      {/* Spinning arc */}
      <path d="M12 2 A10 10 0 0 1 22 12" strokeDasharray="16 47" />
    </svg>
  );
}
