export type ViewMode = 'digital' | 'plot';

export interface ImuWidgetProps {
  robotId: string;
  panelId: string;
  topicName: string;
  throttleMs?: number;
}
