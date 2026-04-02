import { createContext } from 'react';
import type { WorkspaceContextValue } from '../types/WorkspaceContext.types';

/** WorkspaceContext
 * @description Internal React context for mobile workspace state.
 *  Not exported from the feature — consumers use WorkspaceProvider
 *  and useWorkspaceContext instead.
 */
export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
