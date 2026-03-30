/**
 * Renders the fixed header with branding and anchor navigation for the landing page.
 */
export function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-primary border-b border-border shadow-[inset_0_-1px_0_0_var(--color-surface-glow)] h-12 flex items-center px-8">
      <span className="font-sans text-sm font-semibold text-text-primary tracking-widest uppercase">
        Robot Telemetry Dashboard
      </span>
      <nav aria-label="Landing page navigation" className="ml-auto flex gap-6">
        <a
          href="#features"
          aria-label="Jump to Capabilities section"
          className="font-mono text-xs text-text-muted uppercase tracking-widest no-underline transition-colors duration-200 hover:text-accent"
        >
          Capabilities
        </a>
        <a
          href="#demo"
          aria-label="Jump to Demo section"
          className="font-mono text-xs text-text-muted uppercase tracking-widest no-underline transition-colors duration-200 hover:text-accent"
        >
          Demo
        </a>
        <a
          href="https://www.github.com/jragni/robot-telemetry-dashboard"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open GitHub repository in new tab"
          className="font-mono text-xs text-text-muted uppercase tracking-widest no-underline transition-colors duration-200 hover:text-accent"
        >
          GitHub
        </a>
      </nav>
    </header>
  );
}
