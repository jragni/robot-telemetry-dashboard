import { STATUS_STATES } from '../constants';

/** StatusIndicators
 * @description Renders the four system status states (Nominal, Caution,
 *  Critical, Offline) as cards with triple-redundant indicators per
 *  MIL-STD-1472H: color dot, icon, and text label.
 */
export function StatusIndicators() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {STATUS_STATES.map((status) => {
        const IconComponent = status.Icon;
        return (
          <article
            key={status.label}
            className={`${status.bgClass} rounded-sm border border-border p-4 flex flex-col items-center gap-3`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`size-2.5 rounded-full ${status.dotClass}`}
                aria-hidden="true"
              />
              <IconComponent className={`size-5 ${status.colorClass}`} aria-hidden="true" />
            </div>
            <span className={`font-sans text-sm font-semibold ${status.colorClass}`}>
              {status.label}
            </span>
            <span className="font-mono text-xs text-text-muted">
              color + icon + label
            </span>
          </article>
        );
      })}
    </div>
  );
}
