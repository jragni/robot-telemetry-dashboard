import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// CVA variants
// ---------------------------------------------------------------------------

const spinnerVariants = cva('animate-spin-slow', {
  variants: {
    size: {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

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
