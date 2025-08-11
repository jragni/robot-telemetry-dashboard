/**
 * control section helpers
 */

import { TopicSubscription} from "@/components/dashboard/definitions";
import { ComboBoxOption } from "../combobox";

export const getOptionsFromSubs = (subs: TopicSubscription[]): ComboBoxOption[] => {
  return subs.reduce(
    (prev, { topicName }) => [
      ...prev,
      { label: topicName, value: topicName }],
      [] as ComboBoxOption[]
    );
};