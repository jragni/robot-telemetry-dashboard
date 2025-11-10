/**
 * ConnectionSettings Modal
 *
 * Modal for configuring robot connection settings.
 * Allows user to input robot URL and manage connection.
 */

import { Settings, X } from 'lucide-react';
import { useState } from 'react';

import { useRosContext } from './RosContext';

import { Button } from '@/components/ui/button';

interface ConnectionSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectionSettings({
  isOpen,
  onClose,
}: ConnectionSettingsProps) {
  const { connect, disconnect, connectionState, error, activeRobot } =
    useRosContext();

  const [urlInput, setUrlInput] = useState(activeRobot?.url ?? '');

  const handleSave = () => {
    // Note: With multi-robot system, this should add/update robot
    // For now, just close the modal
    onClose();
  };

  const handleConnect = () => {
    connect();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (!isOpen) return null;

  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-sm p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h2 className="text-lg font-mono font-semibold">
              CONNECTION SETTINGS
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Connection Status */}
        <div className="mb-4 p-3 bg-muted rounded-sm">
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? 'bg-green-500 animate-pulse'
                  : isConnecting
                    ? 'bg-yellow-500 animate-pulse'
                    : 'bg-muted-foreground/30'
              }`}
            />
            <span className="text-xs font-mono font-semibold">
              {connectionState.toUpperCase()}
            </span>
          </div>
          {error && (
            <p className="text-xs text-red-500 font-mono mt-1">
              Error: {error.message}
            </p>
          )}
        </div>

        {/* URL Input */}
        <div className="mb-4">
          <label
            htmlFor="robot-url"
            className="block text-xs font-mono font-semibold mb-2"
          >
            ROBOT URL
          </label>
          <input
            id="robot-url"
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="ws://localhost:9090"
            className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isConnected}
          />
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Enter the WebSocket URL of your robot's rosbridge server
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isConnected ? (
            <Button
              onClick={handleDisconnect}
              variant="destructive"
              className="flex-1"
            >
              DISCONNECT
            </Button>
          ) : (
            <>
              <Button
                onClick={handleConnect}
                disabled={!urlInput || isConnecting}
                className="flex-1"
              >
                {isConnecting ? 'CONNECTING...' : 'CONNECT'}
              </Button>
              <Button onClick={handleSave} variant="outline" className="flex-1">
                SAVE
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
