import { useConnectionStore } from '@/stores/connection/useConnectionStore';

import { formatConnectionSummary, selectConnectedCount } from './StatusBar.helpers';

/** StatusBar
 * @description Renders the footer status bar. Reflects the live count of
 *  connected robots from the connection store. Topic count and link latency
 *  are intentionally omitted until a real shell-level source exists (the shell
 *  must not force a per-robot ROS subscription, and rosbridge exposes no RTT).
 */
export function StatusBar() {
  const connectedCount = useConnectionStore(selectConnectedCount);

  return (
    <footer className="bg-surface-primary border-t border-border flex items-center px-3 gap-3.5 h-full font-mono text-xs shadow-glow-top">
      <span className="font-mono text-text-muted">{formatConnectionSummary(connectedCount)}</span>
    </footer>
  );
}
