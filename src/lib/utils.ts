import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** cn
 * @description Merges Tailwind CSS class names with conflict resolution via clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
