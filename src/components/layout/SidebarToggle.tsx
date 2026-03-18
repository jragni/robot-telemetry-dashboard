import { Menu, X } from 'lucide-react';

import type { SidebarToggleProps } from './SidebarToggle.types';

import { useUIStore } from '@/stores/ui/ui.store';

/**
 * Thin vertical strip between the sidebar and main content with a
 * hamburger / close icon. Always visible — even when the sidebar is
 * collapsed — so the user can always re-open it.
 */
export function SidebarToggle({ open }: SidebarToggleProps) {
  const handleToggle = () => useUIStore.getState().toggleSidebar();

  return (
    <div className="flex shrink-0 flex-col items-center border-r border-border bg-card pt-2 px-0.5">
      <button
        type="button"
        onClick={handleToggle}
        aria-label={open ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={open}
        className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
      >
        {open ? (
          <X className="w-4 h-4" aria-hidden="true" />
        ) : (
          <Menu className="w-4 h-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
