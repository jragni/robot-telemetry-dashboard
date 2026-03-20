export interface DashboardModeProps {
  isMobile?: boolean;
}

export interface PanelConfig {
  i: string;
  label: string;
  isClosable: boolean;
  isSovereign: boolean;
  WidgetComponent: React.ComponentType<{ panelId: string }> | null;
}
