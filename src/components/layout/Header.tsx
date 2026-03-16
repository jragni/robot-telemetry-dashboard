import { Menu, X } from 'lucide-react';

import { ActiveRobotBadge } from './ActiveRobotBadge';
import { NavItem } from './NavItem';

import { APP_CONFIG } from '@/config/constants';
import { useUIStore } from '@/stores/ui/ui.store';

/**
 * Top navigation bar.
 *
 * Left:   hamburger (mobile) + app title
 * Center: Dashboard | Fleet | Map NavLinks (hidden on mobile)
 * Right:  active robot status indicator
 */
export function Header() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  // Use getState() to avoid the unbound-method lint warning on store actions
  const handleToggleSidebar = () => useUIStore.getState().toggleSidebar();

  return (
    <header
      role="banner"
      className="h-12 shrink-0 border-b border-border bg-card px-3 flex items-center gap-3 z-30"
    >
      {/* Sidebar toggle (hamburger) */}
      <button
        type="button"
        onClick={handleToggleSidebar}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={sidebarOpen}
        className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
      >
        {sidebarOpen ? (
          <X className="w-4 h-4" aria-hidden="true" />
        ) : (
          <Menu className="w-4 h-4" aria-hidden="true" />
        )}
      </button>

      {/* App title */}
      <span className="font-mono text-sm font-semibold tracking-widest text-primary uppercase shrink-0">
        {APP_CONFIG.APP_NAME}
      </span>

      {/* Center nav — hidden on small screens */}
      <nav
        aria-label="Main navigation"
        className="hidden md:flex items-center gap-1 mx-auto"
      >
        <NavItem to="/dashboard" label="Dashboard" />
        <NavItem to="/fleet" label="Fleet" />
        <NavItem to="/map" label="Map" />
      </nav>

      {/* Right: active robot indicator */}
      <div className="ml-auto flex items-center gap-3">
        <ActiveRobotBadge />
      </div>
    </header>
  );
}
