import type { Direction } from '../control.types';

export interface UseControlPublisherResult {
  publish: (direction: Direction) => void;
  isReady: boolean;
}
