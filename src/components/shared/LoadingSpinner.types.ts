import type { VariantProps } from 'class-variance-authority';

import type { spinnerVariants } from './LoadingSpinner.variants';

export interface LoadingSpinnerProps extends VariantProps<
  typeof spinnerVariants
> {
  className?: string;
}
