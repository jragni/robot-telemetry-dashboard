import type { Direction } from '@/types/control.types';

export interface ControlPadProps {
  robotId: string | undefined;
}

export interface DirButtonConfig {
  direction: Direction;
  label: string;
  icon: React.ReactNode;
  gridArea: string;
}
