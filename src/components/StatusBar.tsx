/**
 * @description StatusBar — Renders the footer status bar showing connection count and
 *  topic statistics.
 */
export function StatusBar() {
  return (
    <footer className="bg-surface-primary border-t border-border flex items-center px-3 gap-3.5 h-full font-mono text-xs shadow-[inset_0_1px_0_0_var(--color-surface-glow)]">
      <span className="text-text-muted">No robots connected</span>
      <span className="ml-auto text-text-muted">0 topics · —ms</span>
    </footer>
  );
}
