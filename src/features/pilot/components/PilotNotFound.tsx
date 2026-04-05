import { Link } from 'react-router-dom';

interface PilotNotFoundProps {
  readonly robotId: string | undefined;
}

/** PilotNotFound
 * @description Empty state shown when the pilot view is opened for a robot ID
 *  that doesn't exist in the connection store.
 */
export function PilotNotFound({ robotId }: PilotNotFoundProps) {
  return (
    <section
      aria-label="Robot not found"
      className="flex flex-col items-center justify-center h-full gap-4"
    >
      <p className="font-mono text-xs text-text-muted">Robot not found: {robotId}</p>
      <Link to="/fleet" className="font-mono text-xs text-accent hover:underline">
        Back to Fleet
      </Link>
    </section>
  );
}
