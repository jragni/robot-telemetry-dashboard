import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppShell } from './components/AppShell';
import { ComingSoon } from './components/ComingSoon';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotFound } from './components/NotFound';

const LandingPage = lazy(() =>
  import('./features/landing/LandingPage').then(m => ({ default: m.LandingPage }))
);
const FleetPage = lazy(() =>
  import('./features/fleet/FleetPage').then(m => ({ default: m.FleetPage }))
);
const WorkspacePage = lazy(() =>
  import('./features/workspace/WorkspacePage').then(m => ({ default: m.WorkspacePage }))
);
const PilotPage = lazy(() =>
  import('./features/pilot/PilotPage').then(m => ({ default: m.PilotPage }))
);
const MockupsPage = lazy(() =>
  import('./features/mockups/MockupsPage').then(m => ({ default: m.MockupsPage }))
);

/**
 * Renders the root application with React Router, landing page route, and AppShell-wrapped feature routes.
 */
export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ErrorBoundary>
        <Suspense fallback={<div className="flex h-screen items-center justify-center font-sans text-sm text-text-secondary">Loading...</div>}>
          <Routes>
            {/* Landing page — standalone, outside AppShell, forces dark theme */}
            <Route path="/" element={<LandingPage />} />

            {/* App routes — inside AppShell with sidebar/header/statusbar */}
            <Route element={<AppShell />}>
              <Route path="/fleet" element={<FleetPage />} />
              <Route path="/robot/:id" element={<WorkspacePage />} />
              <Route path="/pilot/:id" element={<PilotPage />} />
              <Route path="/demo" element={<FleetPage />} />
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
