import { Joystick, LayoutGrid, Activity, Network } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FeatureItem } from './types/LandingFeatures.types';

export const FEATURE_ICONS: Record<string, LucideIcon> = {
  '01': Joystick,
  '02': LayoutGrid,
  '03': Activity,
  '04': Network,
};

export const FEATURES: readonly FeatureItem[] = [
  {
    number: '01',
    name: 'Pilot Mode',
    description:
      'First-person robot control. Live camera feed fills the viewport with D-pad and velocity controls overlaid on the video. LiDAR minimap in the corner. Drive any robot like a cockpit.',
  },
  {
    number: '02',
    name: 'Fleet-First Navigation',
    description:
      'See all robots at a glance. Drill into any one for live telemetry, controls, and diagnostics. Fleet health at the top, individual workspaces one click away.',
  },
  {
    number: '03',
    name: 'Live Telemetry',
    description:
      'IMU orientation, time-series plots, LiDAR radar, raw topic values. All streaming in real time at up to 10Hz with memory-safe ring buffers.',
  },
  {
    number: '04',
    name: 'Multi-Robot',
    description:
      'Simultaneous connections with independent status tracking. Each robot gets its own telemetry workspace. Monitor your entire fleet from a single tab.',
  },
];
