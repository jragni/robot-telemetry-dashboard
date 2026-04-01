/** EStopButtonProps
 * @description Props for the E-STOP button subcomponent.
 */
export interface EStopButtonProps {
  readonly disabled: boolean;
  readonly onEmergencyStop: () => void;
}
