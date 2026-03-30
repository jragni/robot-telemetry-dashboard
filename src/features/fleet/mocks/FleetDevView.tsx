import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Camera,
  Compass,
  Gamepad2,
  Radar,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { RobotCard } from '../components/RobotCard/RobotCard';
import { FleetEmptyState } from '../components/FleetEmptyState';
import { AddRobotModal } from '../components/AddRobotModal';
import { WorkspacePanel } from '@/features/workspace/components/WorkspacePanel';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">
      {children}
    </h3>
  );
}

const IMU_VIZ_OPTIONS = [
  { value: 'attitude-compass', label: 'Attitude + Compass' },
  { value: 'numbers', label: 'Numbers Only' },
  { value: 'attitude', label: 'Attitude Indicator' },
  { value: '3d', label: '3D Wireframe' },
] as const;

/** ImuVizSelect
 * @description Renders a dropdown selector for IMU visualization variant.
 * @param value - The currently selected visualization variant.
 * @param onChange - Callback invoked with the new variant value on selection.
 */
function ImuVizSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-6 w-44 font-mono text-xs bg-surface-tertiary border-border px-2">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-surface-secondary border-border">
        {IMU_VIZ_OPTIONS.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="font-mono text-xs"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** FleetDevView
 * @description Renders the dev component viewer showing all UI primitives,
 *  workspace panels, and fleet components.
 */
export function FleetDevView() {
  const [imuViz, setImuViz] = useState('attitude-compass');
  const removeRobot = useConnectionStore((s) => s.removeRobot);
  const addRobot = useConnectionStore((s) => s.addRobot);

  function seedMockData() {
    addRobot('Atlas-01', 'wss://192.168.1.101:9090');
    addRobot('Hermes-02', 'wss://192.168.1.102:9090');
    addRobot('Ghost-04', 'wss://192.168.1.104:9090');

    const store = useConnectionStore.getState();
    store.updateRobot('atlas-01', {
      status: 'connected',
      lastSeen: Date.now(),
    });
    store.updateRobot('hermes-02', {
      status: 'connected',
      lastSeen: Date.now() - 45000,
    });
    store.updateRobot('ghost-04', { status: 'disconnected' });
  }

  function clearAll() {
    const store = useConnectionStore.getState();
    Object.keys(store.robots).forEach((id) => {
      store.removeRobot(id);
    });
  }

  const robots = Object.values(useConnectionStore((s) => s.robots));

  return (
    <div className="flex flex-col gap-8 p-4">
      {/* Header + Nav */}
      <div>
        <h2 className="font-sans text-xl font-semibold text-text-primary mb-2">
          Component Viewer
        </h2>
        <nav className="flex gap-3 mb-4 font-mono text-xs">
          <span className="text-accent border-b border-accent pb-1">
            Components
          </span>
          <Link
            to="/dev/workspace"
            className="text-text-muted hover:text-accent transition-colors pb-1"
          >
            Workspace
          </Link>
        </nav>
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={seedMockData}
            className="text-accent border-accent"
          >
            Seed Mock Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="text-status-critical border-status-critical"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* ── shadcn Primitives ─────────────────────────────────── */}
      <div>
        <SectionTitle>Buttons</SectionTitle>
        <div className="flex flex-wrap gap-3 items-center">
          <Button>Primary</Button>
          <Button variant="outline" className="text-accent border-accent">
            Secondary
          </Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="sm">Small</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>

      <div>
        <SectionTitle>Badges</SectionTitle>
        <div className="flex flex-wrap gap-3 items-center">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge className="bg-status-nominal/10 text-status-nominal border-status-nominal/20">
            Nominal
          </Badge>
          <Badge className="bg-status-caution/10 text-status-caution border-status-caution/20">
            Caution
          </Badge>
          <Badge className="bg-status-critical/10 text-status-critical border-status-critical/20">
            Critical
          </Badge>
          <Badge className="bg-status-offline/10 text-status-offline border-status-offline/20">
            Offline
          </Badge>
        </div>
      </div>

      <div>
        <SectionTitle>Inputs</SectionTitle>
        <div className="flex flex-wrap gap-3 items-center max-w-md">
          <Input placeholder="Default input" />
          <Input placeholder="Disabled" disabled />
        </div>
      </div>

      <div>
        <SectionTitle>Status Indicators (Triple Redundant)</SectionTitle>
        <div className="flex flex-wrap gap-6 items-center font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-status-nominal animate-pulse" />
            <span className="text-status-nominal">NOMINAL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-status-caution" />
            <span className="text-status-caution">CAUTION</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-status-critical" />
            <span className="text-status-critical">CRITICAL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-status-offline" />
            <span className="text-status-offline">OFFLINE</span>
          </div>
        </div>
      </div>

      {/* ── Workspace Panels ──────────────────────────────────── */}
      <div>
        <SectionTitle>Workspace Panels</SectionTitle>
        <div className="grid grid-cols-3 gap-3 h-40">
          <WorkspacePanel
            label="Camera"
            icon={Camera}
            topicName="/camera/image_raw"
          >
            <span className="font-mono text-xs text-text-muted">
              No video feed
            </span>
          </WorkspacePanel>
          <WorkspacePanel label="LiDAR" icon={Radar} topicName="/scan">
            <span className="font-mono text-xs text-text-muted">
              No scan data
            </span>
          </WorkspacePanel>
          <WorkspacePanel label="System Status" icon={Shield}>
            <span className="font-mono text-xs text-text-muted">
              Disconnected
            </span>
          </WorkspacePanel>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-3 gap-3 h-40">
          <WorkspacePanel
            label="IMU Attitude"
            icon={Compass}
            topicName="/imu/data"
            footerActions={<ImuVizSelect value={imuViz} onChange={setImuViz} />}
          >
            <span className="font-mono text-xs text-text-muted">
              {IMU_VIZ_OPTIONS.find((o) => o.value === imuViz)?.label}
            </span>
          </WorkspacePanel>
          <WorkspacePanel label="Controls" icon={Gamepad2}>
            <span className="font-mono text-xs text-text-muted">
              E-Stop / Velocity
            </span>
          </WorkspacePanel>
          <WorkspacePanel label="Telemetry" icon={Activity} topicName="/odom">
            <span className="font-mono text-xs text-text-muted">
              No telemetry
            </span>
          </WorkspacePanel>
        </div>
      </div>

      {/* ── Fleet Components ──────────────────────────────────── */}
      <div>
        <SectionTitle>Fleet — Empty State</SectionTitle>
        <div className="bg-surface-primary border border-border rounded-sm">
          <FleetEmptyState
            onAddRobot={() => {
              /* noop — standalone preview */
            }}
          />
        </div>
      </div>

      <div>
        <SectionTitle>
          Fleet — Robot Cards ({String(robots.length)})
        </SectionTitle>
        {robots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {robots.map((robot) => (
              <RobotCard key={robot.id} robot={robot} onRemove={removeRobot} />
            ))}
          </div>
        ) : (
          <p className="font-mono text-xs text-text-muted">
            No robots — click &quot;Seed Mock Data&quot; above
          </p>
        )}
      </div>

      <div>
        <SectionTitle>Fleet — Add Robot Modal</SectionTitle>
        <AddRobotModal />
      </div>
    </div>
  );
}
