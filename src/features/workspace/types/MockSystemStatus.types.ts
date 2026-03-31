export interface MockSystemStatusProps {
  readonly name: string;
  readonly url: string;
  readonly lastSeen: number | null;
  readonly connected?: boolean;
}
