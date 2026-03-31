import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ComingSoon } from './components/ComingSoon';
import { NotFound } from './components/NotFound';
import { LandingPage } from './features/landing/LandingPage';
import { FleetOverview } from './features/fleet/FleetOverview';
import { RobotWorkspace } from './features/workspace/RobotWorkspace';

/**
 * Renders the root application with React Router, landing page route, and AppShell-wrapped feature routes.
 */
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page — standalone, outside AppShell, forces dark theme */}
        <Route path="/" element={<LandingPage />} />

        {/* App routes — inside AppShell with sidebar/header/statusbar */}
        <Route element={<AppShell />}>
          <Route path="/fleet" element={<FleetOverview />} />
          <Route path="/robot/:id" element={<RobotWorkspace />} />
          <Route path="/pilot/:id" element={<ComingSoon label="Pilot Mode" />} />
          <Route path="/demo" element={<FleetOverview />} />
          <Route path="/map" element={<ComingSoon label="Map" />} />
          <Route path="/settings" element={<ComingSoon label="Settings" />} />
          <Route path="/dev/components" element={<ComingSoon label="Dev Components" />} />
          <Route path="/dev/workspace" element={<ComingSoon label="Dev Workspace" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
