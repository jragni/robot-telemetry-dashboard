import { Menu, X } from 'lucide-react';
import { NavLink } from 'react-router';

import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { APP_CONFIG } from '@/config/constants';
import { cn } from '@/lib/utils';
import { useConnectionsStore } from '@/stores/connections.store';
import { useRosStore } from '@/stores/ros.store';
import { useUIStore } from '@/stores/ui.store';

// ---------------------------------------------------------------------------
// NavItem helper
// ---------------------------------------------------------------------------

interface NavItemProps {
  to: string;
  label: string;
}

function NavItem({ to, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'px-3 py-1 rounded text-xs font-mono font-medium uppercase tracking-wider transition-colors',
          isActive
            ? 'bg-primary/15 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        )
      }
    >
      {label}
    </NavLink>
  );
}

// ---------------------------------------------------------------------------
// ActiveRobotBadge
// ---------------------------------------------------------------------------

function ActiveRobotBadge() {
  const activeRobot = useConnectionsStore((s) => s.getActiveRobot());
  const connectionState = useRosStore((s) =>
    activeRobot ? s.getConnectionState(activeRobot.id) : 'disconnected'
  );

  if (!activeRobot) {
    return (
      <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
        No robot selected
      </span>
    );
  }

  return (
    <span className="hidden sm:flex items-center gap-1.5">
      <StatusIndicator state={connectionState} />
      <span className="font-mono text-xs text-foreground truncate max-w-[120px]">
        {activeRobot.name}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

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
