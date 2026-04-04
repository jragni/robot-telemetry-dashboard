import type { Direction } from '@/types/control.types';

export interface DpadButtonProps {
  readonly activeDirection: Direction | null;
  readonly direction: Direction;
  readonly disabled: boolean;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly label: string;
  readonly onEnd: () => void;
  readonly onStart: (direction: Direction) => void;
}
