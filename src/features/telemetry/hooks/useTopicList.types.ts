export interface RosTopic {
  name: string;
  type: string;
}

export interface UseTopicListResult {
  topics: RosTopic[];
  isLoading: boolean;
  error: string | null;
}
