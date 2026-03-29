/**
 *
 */
export function LandingFooter() {
  return (
    <footer className="bg-surface-primary border-t border-border shadow-[inset_0_1px_0_0_var(--color-surface-glow)] py-8 px-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <span className="font-sans text-sm font-semibold text-text-secondary tracking-wide">
        Robot Telemetry Dashboard
      </span>
      <div className="flex items-center gap-6 flex-col md:flex-row">
        <div className="flex gap-4">
          <a
            href="https://www.github.com/jragni/robot-telemetry-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-text-muted uppercase tracking-widest no-underline transition-colors duration-200 hover:text-accent"
          >
            GitHub
          </a>
          <a
            href="https://www.github.com/jragni/robot-telemetry-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-text-muted uppercase tracking-widest no-underline transition-colors duration-200 hover:text-accent"
          >
            Documentation
          </a>
        </div>
        <span className="font-mono text-xs text-text-muted">
          &copy; jragni 2026
        </span>
      </div>
    </footer>
  );
}
