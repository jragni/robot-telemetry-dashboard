import { Navigate, useParams } from 'react-router';

import { PilotLayout } from '@/features/pilot-mode/components/PilotLayout';
import { PilotMobileLayout } from '@/features/pilot-mode/components/PilotMobileLayout';
import { useMobile } from '@/hooks/use-mobile';

// ---------------------------------------------------------------------------
// PilotView
// ---------------------------------------------------------------------------

/**
 * Route-level entry point for /pilot/:robotId.
 *
 * - Redirects to /dashboard if robotId is missing.
 * - Renders the desktop FPOV layout on large screens.
 * - Renders the touch-optimised mobile layout on small screens.
 */
export function PilotView() {
  const { robotId } = useParams<{ robotId: string }>();
  const isMobile = useMobile();

  if (!robotId) return <Navigate to="/dashboard" replace />;

  return isMobile ? (
    <PilotMobileLayout robotId={robotId} />
  ) : (
    <PilotLayout robotId={robotId} />
  );
}
