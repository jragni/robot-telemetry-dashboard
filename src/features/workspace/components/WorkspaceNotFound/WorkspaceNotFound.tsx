import { Link } from 'react-router-dom';

import type { WorkspaceNotFoundProps } from './WorkspaceNotFound.types';

/** WorkspaceNotFound
 * @description Renders a centered message when the requested robot ID does not
 *  match any robot in the connection store, with a link back to the fleet page.
 * @prop robotId - The robot ID that was not found.
 */
export function WorkspaceNotFound({ robotId }: WorkspaceNotFoundProps) {
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
