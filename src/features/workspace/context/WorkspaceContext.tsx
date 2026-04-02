import type { WorkspaceContextValue } from '../types/WorkspaceContext.types';
import { WorkspaceContext } from './workspaceContextDef';

/** WorkspaceProvider
 * @description Provides workspace state to mobile workspace descendants,
 *  eliminating multi-level prop relay through RobotWorkspaceMobile and
 *  ActivePanelContent.
 * @param value - The workspace state to provide.
 * @param children - Child components that consume the context.
 */
export function WorkspaceProvider({
  children,
  value,
}: {
  readonly children: React.ReactNode;
  readonly value: WorkspaceContextValue;
}) {
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
