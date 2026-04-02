import { Link } from 'react-router-dom';

/** LandingHeader
 * @description Renders the fixed header with branding and anchor navigation
 *  for the landing page.
 */
export function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-primary border-b border-border shadow-glow-bottom h-12 flex items-center px-4 sm:px-8">
      <Link
        to="/"
        className="font-sans text-sm font-semibold text-text-primary tracking-widest uppercase no-underline transition-colors duration-200 hover:text-accent cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      >
        Robot Telemetry Dashboard
      </Link>
      <nav aria-label="Landing page navigation" className="ml-auto hidden sm:flex gap-6">
        <a
          href="#features"
          aria-label="Jump to Capabilities section"
          className="font-mono text-xs text-text-muted uppercase tracking-widest no-underline transition-colors duration-200 hover:text-accent cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        >
          Capabilities
        </a>
        <a
          href="#demo"
          aria-label="Jump to Demo section"
          className="font-mono text-xs text-text-muted uppercase tracking-widest no-underline transition-colors duration-200 hover:text-accent cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        >
          Demo
        </a>
        <a
          href="https://www.github.com/jragni/robot-telemetry-dashboard"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open GitHub repository in new tab"
          className="font-mono text-xs text-text-muted uppercase tracking-widest no-underline transition-colors duration-200 hover:text-accent cursor-pointer focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        >
          GitHub
        </a>
      </nav>
    </header>
  );
}
