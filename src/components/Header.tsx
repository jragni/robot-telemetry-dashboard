import { useLocation } from 'react-router-dom';
import type { HeaderProps } from './Header.types';

function getBreadcrumb(pathname: string): string {
  if (pathname === '/' || pathname === '/fleet') return 'Fleet';
  if (pathname.startsWith('/robot/')) {
    const id = pathname.split('/')[2] ?? '';
    return `Fleet / ${id}`;
  }
  if (pathname === '/demo') return 'Demo';
  if (pathname === '/map') return 'Map';
  if (pathname === '/settings') return 'Settings';
  return '';
}

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
      {/* Hamburger — mobile only */}
      {showHamburger && (
        <button
          type="button"
          onClick={onToggleDrawer}
          aria-label="Open navigation"
          className="flex items-center justify-center w-[30px] h-[30px] bg-transparent border border-border rounded-sm cursor-pointer text-text-secondary text-sm transition-all duration-200 hover:border-border-hover hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 md:hidden"
        >
          ☰
        </button>
      )}

      <span className="font-sans text-sm font-semibold text-text-primary tracking-wide whitespace-nowrap">
        ROBOCOMMAND<span className="text-accent">●</span>
      </span>

      <span className="font-mono text-xs text-text-muted whitespace-nowrap overflow-hidden text-ellipsis hidden md:inline">
        {breadcrumb}
      </span>

      <div className="ml-auto flex items-center shrink-0">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          className="flex items-center justify-center w-7 h-7 text-sm text-text-muted bg-surface-tertiary border border-border rounded-sm cursor-pointer transition-all duration-200 hover:border-border-hover hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          ◐
        </button>
      </div>
    </header>
  );
}
