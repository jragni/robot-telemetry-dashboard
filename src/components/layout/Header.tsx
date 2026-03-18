import { ActiveRobotBadge } from './ActiveRobotBadge';
import { NavItem } from './NavItem';

import { APP_CONFIG } from '@/config/constants';

/**
 * Top navigation bar.
 *
 * Left:   app title
 * Center: Dashboard | Fleet | Map NavLinks (hidden on mobile)
 * Right:  active robot status indicator
 *
 * The sidebar toggle (hamburger) lives in DashboardShell beside the sidebar,
 * not in the header — it controls the sidebar, not the navigation.
 */
export function Header() {
  return (
    <header
      role="banner"
      className="h-12 shrink-0 border-b border-border bg-card px-3 flex items-center gap-3 z-30"
    >
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
