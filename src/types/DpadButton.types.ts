import type { Direction } from '@/types/control.types';

export interface DpadButtonProps {
  readonly direction: Direction;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly label: string;
  readonly activeDirection: Direction | null;
  readonly disabled: boolean;
  readonly onStart: (direction: Direction) => void;
  readonly onEnd: () => void;
}
