import type { PilotHudData } from '../pilot-mode.types';

export interface UsePilotModeResult {
  hudData: PilotHudData;
  exit: () => void;
}
