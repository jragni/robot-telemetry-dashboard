export interface DataPlotWidgetProps {
  robotId: string;
  panelId: string;
  topicName: string;
  selectedFields?: string[];
  windowSecs?: number;
  throttleMs?: number;
}
