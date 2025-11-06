import ControlPanel from '../control/ControlPanel';
import TelemetryPanel from '../telemetry/TelemetryPanel';
import VideoPlaceholder from '../video/VideoPlaceholder';

import Header from './Header';

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="flex flex-col lg:col-span-2 gap-2">
            <VideoPlaceholder />
            <ControlPanel />
          </div>

          <div className="space-y-4">
            <TelemetryPanel />
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
