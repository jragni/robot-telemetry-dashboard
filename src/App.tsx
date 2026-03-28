import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './shared/components/AppShell';

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
        <Route element={<AppShell />}>
          <Route path="/" element={<FleetPlaceholder />} />
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
