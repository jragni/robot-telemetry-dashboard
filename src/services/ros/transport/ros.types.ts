export interface IRos {
  isConnected: boolean;
  connect(): void;
  close(): void;
  on(event: string, callback: (...args: unknown[]) => void): void;
  off(event: string, callback: (...args: unknown[]) => void): void;
  removeAllListeners(): void;
  getTopics(
    callback: (result: { topics: string[]; types: string[] }) => void,
    errorCallback?: (error: string) => void
  ): void;
}

export interface ITopic {
  name: string;
  messageType: string;
  advertise(): void;
  unadvertise(): void;
  publish(message: unknown): void;
  subscribe(callback: (...args: unknown[]) => void): void;
  unsubscribe(): void;
}

export type ITopicFactory = (options: {
  ros: IRos;
  name: string;
  messageType: string;
}) => ITopic;
