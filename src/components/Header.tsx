import { useLocation } from 'react-router-dom';
import { Menu, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HeaderProps } from './Header.types';

/**
 * Derives breadcrumb text from the current route pathname.
 */
function getBreadcrumb(pathname: string): string {
  if (pathname === '/' || pathname === '/fleet') return 'Fleet';
  if (pathname.startsWith('/robot/')) {
    const id = pathname.split('/')[2] ?? '';
    return `Fleet / ${id}`;
  }
  if (pathname.startsWith('/pilot/')) {
    const id = pathname.split('/')[2] ?? '';
    return `Pilot / ${id}`;
  }
  if (pathname === '/pilot') return 'Pilot';
  if (pathname === '/demo') return 'Demo';
  if (pathname === '/map') return 'Map';
  if (pathname === '/settings') return 'Settings';
  if (pathname === '/dev/components') return 'Dev / Components';
  if (pathname === '/dev/workspace') return 'Dev / Workspace';
  return '';
}

/**
 * Navigation header with breadcrumb, theme toggle, and mobile hamburger.
 */
export function Header({
  onToggleDrawer,
  showHamburger = false,
  theme,
  onToggleTheme,
}: HeaderProps) {
  const location = useLocation();
  const breadcrumb = getBreadcrumb(location.pathname);

  return (
    <header className="bg-surface-primary border-b border-border flex items-center px-3 gap-2.5 h-full shadow-[inset_0_-1px_0_0_var(--color-surface-glow)] relative z-10">
      {showHamburger && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleDrawer}
          aria-label="Open navigation"
          className="w-8 h-8 text-text-secondary border border-border hover:border-border-hover hover:text-text-primary md:hidden"
        >
          <Menu size={16} />
        </Button>
      )}

      <span className="font-sans text-sm font-semibold text-text-primary tracking-wide whitespace-nowrap">
        <span className="hidden md:inline">Robot Telemetry Dashboard</span>
        <span className="md:hidden">RTD</span>
      </span>

      <span className="font-mono text-xs text-text-muted whitespace-nowrap overflow-hidden text-ellipsis hidden md:inline">
        {breadcrumb}
      </span>

      <div className="ml-auto flex items-center shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          className="w-7 h-7 text-text-muted bg-surface-tertiary border border-border hover:border-border-hover hover:text-text-primary"
        >
          {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
        </Button>
      </div>
    </header>
  );
}
