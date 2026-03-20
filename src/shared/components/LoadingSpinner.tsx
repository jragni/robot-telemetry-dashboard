import type {
  LoadingSpinnerProps,
  LoadingSpinnerSize,
} from './LoadingSpinner.types';

import { cn } from '@/lib/utils';

const sizeStyles: Record<LoadingSpinnerSize, string> = {
  sm: 'size-4 border-[1.5px]',
  md: 'size-6 border-2',
  lg: 'size-10 border-[3px]',
};

export function LoadingSpinner({
  size = 'md',
  className,
  label = 'Loading',
}: LoadingSpinnerProps) {
  return (
    <span
      className={cn('inline-flex items-center justify-center', className)}
      role="status"
      aria-label={label}
    >
      <span
        className={cn(
          'animate-spin rounded-full border-current border-r-transparent',
          sizeStyles[size]
        )}
      />
    </span>
  );
}
