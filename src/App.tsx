import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { LandingPage } from './features/landing/LandingPage';
import { FleetOverview } from './features/fleet/FleetOverview';
import { FleetDevView } from './features/fleet/mocks/FleetDevView';
import { WorkspaceDevView } from './features/workspace/mocks/WorkspaceDevView';
import { RobotWorkspace } from './features/workspace/RobotWorkspace';

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-full font-mono text-xs text-text-muted">
      {label} — coming soon
    </div>
  );
}

/**
 *
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
          <Route path="/demo" element={<FleetOverview />} />
          <Route path="/map" element={<ComingSoon label="Map" />} />
          <Route path="/settings" element={<ComingSoon label="Settings" />} />
          <Route path="/dev/components" element={<FleetDevView />} />
          <Route path="/dev/workspace" element={<WorkspaceDevView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
