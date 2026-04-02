import { ArrowLeft } from 'lucide-react';
import type { MobileHeaderProps } from '../types/MobileHeader.types';

/** MobileHeader
 * @description Renders the full-screen mobile form header with back arrow.
 * @param onClose - Callback to close the form.
 */
export function MobileHeader({ onClose }: MobileHeaderProps) {
  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b border-border sm:hidden">
      <button
        type="button"
        onClick={onClose}
        className="text-text-secondary hover:text-text-primary transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none rounded-sm"
        aria-label="Close add robot form"
      >
        <ArrowLeft size={20} />
      </button>
      <h2 className="font-sans text-sm font-semibold text-text-primary uppercase tracking-wide">
        Add Robot
      </h2>
    </header>
  );
}
