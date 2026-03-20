import type { createControlStore } from '../../stores/controlStore';

export interface ControlPadProps {
  controlStore: ReturnType<typeof createControlStore>;
  disabled?: boolean;
}
