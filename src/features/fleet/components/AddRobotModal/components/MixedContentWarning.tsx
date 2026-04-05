import { AlertTriangle } from 'lucide-react';

/** MixedContentWarning
 * @description Warns that ws:// URLs are blocked from HTTPS pages.
 */
export function MixedContentWarning() {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-sm border border-status-caution/30 bg-status-caution/10 px-3 py-2"
    >
      <AlertTriangle size={14} className="text-status-caution shrink-0 mt-0.5" />
      <p className="font-sans text-xs text-status-caution">
        This page is served over HTTPS. Browsers block insecure ws:// connections
        from secure pages. Use wss:// or a proxy with TLS.
      </p>
    </div>
  );
}
