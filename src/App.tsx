import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './shared/components/AppShell';
import { LandingPage } from './features/landing/LandingPage';

function FleetPlaceholder() {
  return (
    <div className="flex items-center justify-center h-full font-mono text-xs text-text-muted">
      Fleet Overview — coming soon
    </div>
  );
}

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
          <Route path="/fleet" element={<FleetPlaceholder />} />
          <Route path="/robot/:id" element={<WorkspacePlaceholder />} />
          <Route path="/demo" element={<FleetPlaceholder />} />
          <Route path="/map" element={<FleetPlaceholder />} />
          <Route path="/settings" element={<FleetPlaceholder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
