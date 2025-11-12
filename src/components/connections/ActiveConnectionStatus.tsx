/**
 * ActiveConnectionStatus
 *
 * Displays the currently active robot connection status and controls.
 */

import { Power, PowerOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { RobotConnection } from '@/contexts/ros/definitions';

interface ActiveConnectionStatusProps {
  activeRobot: RobotConnection;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ActiveConnectionStatus({
  activeRobot,
  connectionState,
  onConnect,
  onDisconnect,
}: ActiveConnectionStatusProps) {
  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';

  return (
    <div className="p-4 mb-4 border-2 border-primary/20 rounded-sm bg-accent/50 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-mono font-semibold text-foreground truncate">
            {activeRobot.name}
          </p>
          <p className="text-xs font-mono text-muted-foreground truncate">
            {activeRobot.url}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected
                ? 'bg-green-500 animate-pulse'
                : isConnecting
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-muted-foreground/30'
            }`}
            aria-hidden="true"
          />
          <span className="text-xs font-mono font-semibold">
            {isConnected
              ? 'CONNECTED'
              : isConnecting
                ? 'CONNECTING'
                : 'DISCONNECTED'}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        {isConnected ? (
          <Button
            onClick={onDisconnect}
            variant="destructive"
            size="sm"
            className="flex-1 h-8"
          >
            <PowerOff className="w-3 h-3 mr-1.5" />
            DISCONNECT
          </Button>
        ) : (
          <Button
            onClick={onConnect}
            disabled={isConnecting}
            size="sm"
            className="flex-1 h-8"
          >
            <Power className="w-3 h-3 mr-1.5" />
            {isConnecting ? 'CONNECTING...' : 'CONNECT'}
          </Button>
        )}
      </div>
    </div>
  );
}
