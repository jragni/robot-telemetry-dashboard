/**
 * AddRobotModal
 *
 * Modal for adding a new robot connection.
 */

import { AlertCircle, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface AddRobotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, url: string) => void;
}

/**
 * Validates WebSocket URL format
 */
function isValidWebSocketUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'ws:' || urlObj.protocol === 'wss:';
  } catch {
    return false;
  }
}

export function AddRobotModal({ isOpen, onClose, onAdd }: AddRobotModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  const validateUrl = (value: string) => {
    if (!value.trim()) {
      setUrlError('');
      return;
    }
    if (!isValidWebSocketUrl(value)) {
      setUrlError('Invalid WebSocket URL. Must start with ws:// or wss://');
    } else {
      setUrlError('');
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    validateUrl(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();

    if (!trimmedName || !trimmedUrl) return;

    if (!isValidWebSocketUrl(trimmedUrl)) {
      setUrlError('Invalid WebSocket URL. Must start with ws:// or wss://');
      return;
    }

    onAdd(trimmedName, trimmedUrl);
    setName('');
    setUrl('');
    setUrlError('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setUrl('');
    setUrlError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono">
            <Plus className="w-5 h-5" />
            ADD ROBOT
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="robot-name"
              className="block text-xs font-mono font-semibold"
            >
              ROBOT NAME
            </label>
            <Input
              id="robot-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Robot"
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="robot-url"
              className="block text-xs font-mono font-semibold"
            >
              WEBSOCKET URL
            </label>
            <Input
              id="robot-url"
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="ws://localhost:9090"
              className={`font-mono ${urlError ? 'border-destructive' : ''}`}
              aria-invalid={!!urlError}
              aria-describedby={urlError ? 'url-error' : 'url-help'}
            />
            {urlError ? (
              <div
                id="url-error"
                className="flex items-center gap-1 text-xs text-destructive font-mono"
              >
                <AlertCircle className="w-3 h-3" />
                {urlError}
              </div>
            ) : (
              <p
                id="url-help"
                className="text-xs text-muted-foreground font-mono"
              >
                Enter the WebSocket URL of your robot's rosbridge server
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !url.trim() || !!urlError}
              className="flex-1"
            >
              ADD ROBOT
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
