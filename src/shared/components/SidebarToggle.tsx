import { Menu, X } from 'lucide-react';

import type { SidebarToggleProps } from './SidebarToggle.types';

export function SidebarToggle({ isOpen, onToggle }: SidebarToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-5 items-center justify-center border-r border-border bg-card/50 text-muted-foreground transition-colors hover:text-foreground"
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
    >
      {isOpen ? <X size={14} /> : <Menu size={14} />}
    </button>
  );
}
