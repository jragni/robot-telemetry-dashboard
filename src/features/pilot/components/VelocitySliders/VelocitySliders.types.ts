import type { createControlStore } from '../../stores/controlStore';

export interface VelocitySlidersProps {
  controlStore: ReturnType<typeof createControlStore>;
}
