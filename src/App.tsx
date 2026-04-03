import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AppShell } from './components/AppShell';
import { ComingSoon } from './components/ComingSoon';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotFound } from './components/NotFound';

const FleetOverview = lazy(() =>
  import('./features/fleet/FleetOverview').then(m => ({ default: m.FleetOverview }))
);
const LandingPage = lazy(() =>
  import('./features/landing/LandingPage').then(m => ({ default: m.LandingPage }))
);
const MockupsPage = lazy(() =>
  import('./features/mockups/MockupsPage').then(m => ({ default: m.MockupsPage }))
);
const PilotView = lazy(() =>
  import('./features/pilot/PilotView').then(m => ({ default: m.PilotView }))
);
const RobotWorkspace = lazy(() =>
  import('./features/workspace/RobotWorkspace').then(m => ({ default: m.RobotWorkspace }))
);

/**
 * Renders the root application with React Router, landing page route, and AppShell-wrapped feature routes.
 */
export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center bg-surface-base">
              <span className="text-text-secondary font-sans text-sm">Loading...</span>
            </div>
          }
        >
          <Routes>
            {/* Landing page — standalone, outside AppShell, forces dark theme */}
            <Route path="/" element={<LandingPage />} />

            {/* App routes — inside AppShell with sidebar/header/statusbar */}
            <Route element={<AppShell />}>
              <Route path="/fleet" element={<FleetOverview />} />
              <Route path="/robot/:id" element={<RobotWorkspace />} />
              <Route path="/pilot/:id" element={<PilotView />} />
              <Route path="/map" element={<ComingSoon label="Map" />} />
              <Route path="/settings" element={<ComingSoon label="Settings" />} />
              <Route path="/mockups" element={<MockupsPage />} />
              <Route path="/dev/components" element={<ComingSoon label="Dev Components" />} />
              <Route path="/dev/workspace" element={<ComingSoon label="Dev Workspace" />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
