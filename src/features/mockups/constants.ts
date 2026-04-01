import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  WifiOff,
  LayoutGrid,
  Crosshair,
  Map,
  Settings,
  Plus,
  X,
  Wifi,
  Battery,
  Thermometer,
  Clock,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Camera,
  Compass,
  Activity,
  Radio,
  Palette,
} from 'lucide-react';
import type {
  MockSection,
  ColorTokenGroup,
  TypographySample,
  SpacingStep,
  StatusState,
  ButtonVariantDemo,
  IconEntry,
  BorderEffect,
  AnimationEntry,
} from './types/MockupsPage.types';

/** MOCK_SECTIONS
 * @description All navigable sections on the mockups page.
 */
export const MOCK_SECTIONS: readonly MockSection[] = [
  { id: 'colors', title: 'Color Tokens', description: 'Design system color palette by namespace' },
  { id: 'typography', title: 'Typography Scale', description: 'Exo + Roboto Mono at all sizes and weights' },
  { id: 'spacing', title: 'Spacing Scale', description: '4px base unit increments' },
  { id: 'status', title: 'Status Indicators', description: 'Triple-redundant per MIL-STD-1472H' },
  { id: 'buttons', title: 'Button Showcase', description: 'shadcn Button variants and states' },
  { id: 'panels', title: 'Panel Showcase', description: 'Live workspace panel demos with mock data' },
  { id: 'icons', title: 'Icon Grid', description: 'Lucide React icons used in this app' },
  { id: 'borders', title: 'Border Effects', description: 'Panel borders, glows, and shadow effects' },
  { id: 'empty', title: 'Empty States', description: 'Disconnected and no-data states' },
  { id: 'animations', title: 'Animations', description: 'Motion patterns and keyframe animations' },
];

/** COLOR_TOKEN_GROUPS
 * @description Design system tokens grouped by namespace for swatch display.
 */
export const COLOR_TOKEN_GROUPS: readonly ColorTokenGroup[] = [
  {
    namespace: 'Surface',
    tokens: [
      '--color-surface-base',
      '--color-surface-primary',
      '--color-surface-secondary',
      '--color-surface-tertiary',
    ],
  },
  {
    namespace: 'Text',
    tokens: ['--color-text-primary', '--color-text-secondary', '--color-text-muted'],
  },
  {
    namespace: 'Accent',
    tokens: ['--color-accent', '--color-accent-glow', '--color-accent-subtle'],
  },
  {
    namespace: 'Status',
    tokens: [
      '--color-status-nominal',
      '--color-status-nominal-bg',
      '--color-status-caution',
      '--color-status-caution-bg',
      '--color-status-critical',
      '--color-status-critical-bg',
      '--color-status-offline',
      '--color-status-offline-bg',
    ],
  },
  {
    namespace: 'Border',
    tokens: ['--color-border', '--color-border-hover'],
  },
  {
    namespace: 'Effects',
    tokens: ['--color-surface-glow', '--color-hud-overlay', '--color-shadow', '--color-shadow-heavy'],
  },
  {
    namespace: 'Robot Identity',
    tokens: [
      '--color-robot-blue',
      '--color-robot-cyan',
      '--color-robot-green',
      '--color-robot-amber',
      '--color-robot-red',
      '--color-robot-purple',
    ],
  },
];

/** TYPOGRAPHY_SAMPLES
 * @description The four permitted font sizes.
 */
export const TYPOGRAPHY_SAMPLES: readonly TypographySample[] = [
  { sizePx: 36, tailwindClass: 'text-4xl', label: '36px — text-4xl' },
  { sizePx: 20, tailwindClass: 'text-xl', label: '20px — text-xl' },
  { sizePx: 14, tailwindClass: 'text-sm', label: '14px — text-sm' },
  { sizePx: 12, tailwindClass: 'text-xs', label: '12px — text-xs' },
];

/** SPACING_SCALE
 * @description 4px base unit spacing increments.
 */
export const SPACING_SCALE: readonly SpacingStep[] = [
  { px: 4, tailwindClass: 'p-1' },
  { px: 8, tailwindClass: 'p-2' },
  { px: 12, tailwindClass: 'p-3' },
  { px: 16, tailwindClass: 'p-4' },
  { px: 20, tailwindClass: 'p-5' },
  { px: 24, tailwindClass: 'p-6' },
  { px: 32, tailwindClass: 'p-8' },
  { px: 48, tailwindClass: 'p-12' },
  { px: 64, tailwindClass: 'p-16' },
];

/** STATUS_STATES
 * @description The four system status states with triple-redundant indicators.
 */
export const STATUS_STATES: readonly StatusState[] = [
  {
    label: 'Nominal',
    Icon: CheckCircle,
    colorClass: 'text-status-nominal',
    bgClass: 'bg-status-nominal-bg',
    dotClass: 'bg-status-nominal',
  },
  {
    label: 'Caution',
    Icon: AlertTriangle,
    colorClass: 'text-status-caution',
    bgClass: 'bg-status-caution-bg',
    dotClass: 'bg-status-caution',
  },
  {
    label: 'Critical',
    Icon: XCircle,
    colorClass: 'text-status-critical',
    bgClass: 'bg-status-critical-bg',
    dotClass: 'bg-status-critical',
  },
  {
    label: 'Offline',
    Icon: WifiOff,
    colorClass: 'text-status-offline',
    bgClass: 'bg-status-offline-bg',
    dotClass: 'bg-status-offline',
  },
];

/** BUTTON_VARIANTS
 * @description Button variants for the showcase grid.
 */
export const BUTTON_VARIANTS: readonly ButtonVariantDemo[] = [
  { label: 'Primary', variant: 'default' },
  { label: 'Secondary', variant: 'secondary' },
  { label: 'Destructive', variant: 'destructive' },
  { label: 'Ghost', variant: 'ghost' },
  { label: 'Outline', variant: 'outline' },
];

/** ICON_SET
 * @description All Lucide icons used across the application.
 */
export const ICON_SET: readonly IconEntry[] = [
  { name: 'LayoutGrid', Icon: LayoutGrid },
  { name: 'Crosshair', Icon: Crosshair },
  { name: 'Map', Icon: Map },
  { name: 'Settings', Icon: Settings },
  { name: 'Plus', Icon: Plus },
  { name: 'X', Icon: X },
  { name: 'Wifi', Icon: Wifi },
  { name: 'WifiOff', Icon: WifiOff },
  { name: 'Battery', Icon: Battery },
  { name: 'Thermometer', Icon: Thermometer },
  { name: 'Clock', Icon: Clock },
  { name: 'ChevronUp', Icon: ChevronUp },
  { name: 'ChevronDown', Icon: ChevronDown },
  { name: 'ChevronLeft', Icon: ChevronLeft },
  { name: 'ChevronRight', Icon: ChevronRight },
  { name: 'Maximize2', Icon: Maximize2 },
  { name: 'Minimize2', Icon: Minimize2 },
  { name: 'Sun', Icon: Sun },
  { name: 'Moon', Icon: Moon },
  { name: 'AlertTriangle', Icon: AlertTriangle },
  { name: 'CheckCircle', Icon: CheckCircle },
  { name: 'XCircle', Icon: XCircle },
  { name: 'Camera', Icon: Camera },
  { name: 'Compass', Icon: Compass },
  { name: 'Activity', Icon: Activity },
  { name: 'Radio', Icon: Radio },
  { name: 'Palette', Icon: Palette },
];

/** MOCK_LIDAR_POINTS
 * @description Static LiDAR scan data for panel showcase demos.
 */
export const MOCK_LIDAR_POINTS: readonly { angle: number; distance: number }[] = Array.from(
  { length: 120 },
  (_, i) => ({
    angle: (i / 120) * Math.PI * 2,
    distance: 2 + Math.sin(i * 0.3) * 1.5 + Math.random() * 0.5,
  }),
);

/** BORDER_EFFECTS
 * @description Panel border effect samples.
 */
export const BORDER_EFFECTS: readonly BorderEffect[] = [
  { label: 'Default panel border — border border-border', className: 'border border-border' },
  { label: 'Hover border — border border-border-hover', className: 'border border-border-hover' },
  { label: 'Shadow glow top — shadow-glow-top', className: 'border border-border shadow-glow-top' },
  { label: 'Shadow glow bottom — shadow-glow-bottom', className: 'border border-border shadow-glow-bottom' },
  { label: 'Accent border — border-2 border-accent', className: 'border-2 border-accent' },
];

/** ANIMATION_LIST
 * @description Animation samples for the animation showcase.
 */
export const ANIMATION_LIST: readonly AnimationEntry[] = [
  { label: 'Pulse — motion-safe:animate-pulse', className: 'motion-safe:animate-pulse' },
  { label: 'Spin — motion-safe:animate-spin', className: 'motion-safe:animate-spin' },
  { label: 'Bounce — motion-safe:animate-bounce', className: 'motion-safe:animate-bounce' },
  { label: 'Ping — motion-safe:animate-ping', className: 'motion-safe:animate-ping' },
];

/** TELEMETRY_SERIES_COLORS
 * @description Colors for mock telemetry chart series.
 */
export const TELEMETRY_SERIES_COLORS = [
  'oklch(0.7 0.2 230)',
  'oklch(0.7 0.19 155)',
  'oklch(0.75 0.18 65)',
] as const;
