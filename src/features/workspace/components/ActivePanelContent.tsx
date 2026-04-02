import { MOBILE_PANEL_COMPONENTS } from '../constants';

import type { ActivePanelContentProps } from '../types/ActivePanelContent.types';
import type { MobileDataPanelId } from '../types/RobotWorkspaceMobile.types';

/** ActivePanelContent
 * @description Renders the active panel for the mobile workspace layout.
 *  Mobile-only component consumed by RobotWorkspaceMobile. Uses
 *  MOBILE_PANEL_COMPONENTS registry to resolve the component from the
 *  active tab ID.
 */
export function ActivePanelContent({
  activePanel,
  cameraProps,
  imuProps,
  lidarProps,
  statusProps,
  telemetryProps,
}: ActivePanelContentProps) {
  const propsMap: Record<MobileDataPanelId, object> = {
    camera: cameraProps,
    imu: imuProps,
    lidar: lidarProps,
    status: statusProps,
    telemetry: telemetryProps,
  };

  const PanelToRender = MOBILE_PANEL_COMPONENTS[activePanel];
  return <PanelToRender {...propsMap[activePanel]} />;
}
