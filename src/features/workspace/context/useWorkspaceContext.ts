import { useContext } from 'react';
import type { WorkspaceContextValue } from '../types/WorkspaceContext.types';
import { WorkspaceContext } from './workspaceContextDef';

/** useWorkspaceContext
 * @description Retrieves workspace state from the nearest WorkspaceProvider.
 *  Throws if called outside a provider boundary.
 * @returns The current workspace context value.
 */
export function useWorkspaceContext(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider');
  }
  return ctx;
}
