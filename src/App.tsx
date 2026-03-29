import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './shared/components/AppShell';
import { LandingPage } from './features/landing/LandingPage';
import { FleetOverview } from './features/fleet/FleetOverview';
import { FleetDevView } from './features/fleet/FleetDevView';

function WorkspacePlaceholder() {
  return (
    <div className="flex items-center justify-center h-full font-mono text-xs text-text-muted">
      Robot Workspace — coming soon
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page — standalone, outside AppShell, forces dark theme */}
        <Route path="/" element={<LandingPage />} />

        {/* App routes — inside AppShell with sidebar/header/statusbar */}
        <Route element={<AppShell />}>
          <Route path="/fleet" element={<FleetOverview />} />
          <Route path="/robot/:id" element={<WorkspacePlaceholder />} />
          <Route path="/demo" element={<FleetOverview />} />
          <Route path="/map" element={<WorkspacePlaceholder />} />
          <Route path="/settings" element={<WorkspacePlaceholder />} />
          <Route path="/dev/components" element={<FleetDevView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
