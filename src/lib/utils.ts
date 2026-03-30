import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * @description cn — Merges Tailwind CSS class strings, resolving conflicts via tailwind-merge.
 * @param inputs - Class values to merge (strings, arrays, or conditional objects).
 * @returns The merged class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
