import type { Observable } from 'rxjs';

import type { TopicInfo } from '@/shared/types/ros-messages.types';

export interface ITopicDiscovery {
  getTopics$(): Observable<TopicInfo[]>;
}
