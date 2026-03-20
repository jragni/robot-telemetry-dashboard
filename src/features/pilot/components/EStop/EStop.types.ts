import type { createControlStore } from '../../stores/controlStore';

export interface EStopProps {
  controlStore: ReturnType<typeof createControlStore>;
  onActivate?: () => void;
}
