import { cva } from 'class-variance-authority';

// ---------------------------------------------------------------------------
// CVA variants for LoadingSpinner
// ---------------------------------------------------------------------------

export const spinnerVariants = cva('animate-spin-slow', {
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
