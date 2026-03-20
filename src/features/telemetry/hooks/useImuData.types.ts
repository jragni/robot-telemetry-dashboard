import type { ImuMessage } from '../types/ros-sensor-messages.types';
import type { EulerAngles } from '../utils/quaternionToEuler';

export interface ImuHistoryPoint {
  timestamp: number;
  roll: number;
  pitch: number;
  yaw: number;
}

export interface UseImuDataResult {
  imuData: ImuMessage | null;
  euler: EulerAngles | null;
  history: ImuHistoryPoint[];
}
