"use client";

import { useConnection } from "@/components/dashboard/ConnectionProvider";

export default function TopicSection(): React.ReactNode {
  const { selectedConnection } = useConnection();
  const subscriptions = selectedConnection?.subscriptions ?? [];
	console.log(subscriptions)

  return (
    <div>
      <ul>
        {subscriptions.map((sub) => (
          <li key={sub.topicName}>{sub.topicName}</li>
        ))}
      </ul>
    </div>
  );

}