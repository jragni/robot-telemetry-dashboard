/**
 * AddRobotModal
 *
 * Modal for adding a new robot connection.
 */

import { AlertCircle, Plus } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';
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
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Handle input focus to scroll into view on mobile
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Small delay to let keyboard appear
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  // Handle Enter key on name field - move to URL field
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      urlInputRef.current?.focus();
    }
  };

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
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 font-mono">
            <Plus className="w-5 h-5" />
            ADD ROBOT
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto flex-1 min-h-0"
        >
          <FieldSet>
            <Field>
              <FieldLabel
                htmlFor="robot-name"
                className="text-xs font-mono font-semibold"
              >
                ROBOT NAME
              </FieldLabel>
              <Input
                id="robot-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={handleInputFocus}
                onKeyDown={handleNameKeyDown}
                placeholder="My Robot"
                className="font-mono"
                autoComplete="off"
                enterKeyHint="next"
              />
            </Field>

            <Field data-invalid={!!urlError}>
              <FieldLabel
                htmlFor="robot-url"
                className="text-xs font-mono font-semibold"
              >
                BASE URL
              </FieldLabel>
              <Input
                ref={urlInputRef}
                id="robot-url"
                type="text"
                value={url}
                onChange={handleUrlChange}
                onFocus={handleInputFocus}
                placeholder="wss://your-robot.loca.lt"
                className={`font-mono ${urlError ? 'border-destructive' : ''}`}
                aria-invalid={!!urlError}
                autoComplete="off"
                enterKeyHint="done"
              />
              {urlError ? (
                <FieldError className="flex items-center gap-1 text-xs font-mono">
                  <AlertCircle className="w-3 h-3" />
                  {urlError}
                </FieldError>
              ) : (
                <FieldDescription className="text-xs font-mono">
                  Enter your robot's base URL (paths will be added
                  automatically)
                </FieldDescription>
              )}
            </Field>

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
          </FieldSet>
        </form>
      </DialogContent>
    </Dialog>
  );
}
