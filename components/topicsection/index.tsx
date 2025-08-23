'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useConnection } from '@/components/dashboard/ConnectionProvider';
import TopicSectionHeader from './TopicSectionHeader';
import TopicTable from './TopicTable';
import { useHeavyTopics } from './useHeavyTopics';

export default function TopicSection() {
  const { selectedConnection } = useConnection();
  const [isMinimized, setIsMinimized] = useState(false);
  const { isHeavyTopic } = useHeavyTopics();

  const subscriptions = selectedConnection?.subscriptions ?? [];

  if (isMinimized) {
    return (
      <Card className="w-full">
        <TopicSectionHeader
          isMinimized={true}
          onToggleMinimize={() => setIsMinimized(false)}
          subscriptionsCount={subscriptions.length}
        />
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <TopicSectionHeader
        isMinimized={false}
        onToggleMinimize={() => setIsMinimized(true)}
        subscriptionsCount={subscriptions.length}
      />

      <CardContent
        style={{
          maxWidth: 'none',
          overflow: 'visible',
          contain: 'none',
        }}
      >
        {subscriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No topics available</p>
        ) : (
          <div className="relative">
            <TopicTable
              isHeavyTopic={isHeavyTopic}
              selectedConnection={selectedConnection}
              subscriptions={subscriptions}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}