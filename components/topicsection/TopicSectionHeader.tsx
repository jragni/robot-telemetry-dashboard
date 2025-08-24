'use client';

import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minimize2, Maximize2 } from 'lucide-react';

interface TopicSectionHeaderProps {
  isMinimized: boolean;
  onToggleMinimize: () => void;
  subscriptionsCount: number;
}

export default function TopicSectionHeader({
  isMinimized,
  onToggleMinimize,
  subscriptionsCount,
}: TopicSectionHeaderProps) {
  if (isMinimized) {
    return (
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm sm:text-lg">Topics</CardTitle>
            <span className="text-xs text-muted-foreground">
              ({subscriptionsCount} topics)
            </span>
          </div>
          <Button
            aria-label="Expand section"
            onClick={onToggleMinimize}
            size="sm"
            variant="ghost"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
    );
  }

  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm sm:text-lg">Topics ({subscriptionsCount})</CardTitle>
        <Button
          aria-label="Minimize section"
          onClick={onToggleMinimize}
          size="sm"
          variant="ghost"
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  );
}