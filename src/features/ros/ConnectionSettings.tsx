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
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

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

  // Handle input focus to scroll into view on mobile
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Small delay to let keyboard appear
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isConnected) {
      handleDisconnect();
    } else {
      handleConnect();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border border-border rounded-sm w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
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

        <form
          onSubmit={handleFormSubmit}
          className="overflow-y-auto flex-1 min-h-0 px-6 pb-6"
        >
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
          <FieldSet>
            <Field>
              <FieldLabel
                htmlFor="robot-url"
                className="text-xs font-mono font-semibold"
              >
                ROBOT URL
              </FieldLabel>
              <Input
                id="robot-url"
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onFocus={handleInputFocus}
                placeholder="ws://localhost:9090"
                className="font-mono"
                disabled={isConnected}
                autoComplete="off"
                enterKeyHint={isConnected ? 'done' : 'go'}
              />
              <FieldDescription className="text-xs font-mono">
                Enter the WebSocket URL of your robot's rosbridge server
              </FieldDescription>
            </Field>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {isConnected ? (
                <Button type="submit" variant="destructive" className="flex-1">
                  DISCONNECT
                </Button>
              ) : (
                <>
                  <Button
                    type="submit"
                    disabled={!urlInput || isConnecting}
                    className="flex-1"
                  >
                    {isConnecting ? 'CONNECTING...' : 'CONNECT'}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSave}
                    variant="outline"
                    className="flex-1"
                  >
                    SAVE
                  </Button>
                </>
              )}
            </div>
          </FieldSet>
        </form>
      </div>
    </div>
  );
}
