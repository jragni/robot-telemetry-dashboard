'use client';

import { ChangeEvent, useRef, useState, KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { v4 as uuidV4 } from 'uuid';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConnection } from '@/components/dashboard/ConnectionProvider';

import { ConnectionDialogFormData } from './definitions';
import { validateAddConnectionForm } from './helpers';


/**
 * AddConnectionDialog
 *
 * @description
 * Dialog that adds a data source to the dashboard
 */
export default function AddConnectionDialog(): React.ReactNode {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<ConnectionDialogFormData>({
    connectionName: '',
    webSocketUrl: '',
  });

  const { addConnection, connections } = useConnection();

  // Refs for field focusing
  const connectionNameRef = useRef<HTMLInputElement>(null);
  const webSocketUrlRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFormData({
      connectionName: '',
      webSocketUrl: '',
    });
    setIsLoading(false);
  };

  const handleUpdateForm = (e: ChangeEvent<HTMLInputElement>, field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      setIsLoading(true);
      const { reason, status } = validateAddConnectionForm(formData, connections);
      if (status === 'valid') {
        await addConnection(
          uuidV4(),
          formData.connectionName.trim(),
          formData.webSocketUrl.trim(),
        );
        resetForm();
        setIsOpen(false);
        toast.success('Connection added successfully!');
      } else {
        // Frontend error validation
        toast.error(reason);
      }
    } catch {
      // Handle error (show toast, error message, etc.)
      toast.error('Unable to add data source. Please verify WebSocket URL is valid.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, currentField: 'connectionName' | 'webSocketUrl') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentField === 'connectionName') {
        // Move to next field
        webSocketUrlRef.current?.focus();
      } else if (currentField === 'webSocketUrl') {
        // Submit form if all fields are filled
        if (formData.connectionName && formData.webSocketUrl) {
          handleSubmit();
        }
      }
    }
  };

  return (
    <Dialog onOpenChange={() => setIsOpen(!isOpen)} open={isOpen}>
      <DialogTrigger asChild>
        <Button className="my-2" variant="outline">
          <Plus className="h-4 mr-2 w-4" />
          <span>Add Data Source</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Data Source to Dashboard</DialogTitle>
          <DialogDescription>Add Robot or Data Source</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="connection-name-input">Data Source Name:</Label>
            <Input
              className="my-2"
              enterKeyHint="next"
              id="connection-name-input"
              inputMode="text"
              onChange={(e) => handleUpdateForm(e, 'connectionName')}
              onKeyDown={(e) => handleKeyDown(e, 'connectionName')}
              placeholder="Robot 1"
              ref={connectionNameRef}
              value={formData.connectionName}
            />
          </div>
          <div>
            <Label htmlFor="websocket-url-input">WebSocket URL:</Label>
            <Input
              className="my-2"
              enterKeyHint="done"
              id="websocket-url-input"
              inputMode="url"
              onChange={(e) => handleUpdateForm(e, 'webSocketUrl')}
              onKeyDown={(e) => handleKeyDown(e, 'webSocketUrl')}
              placeholder="ws://192.168.1.100:9090 or https://1.tcp.us-cal-3.ngrok.io:12345"
              ref={webSocketUrlRef}
              value={formData.webSocketUrl}
            />
          </div>
          <div className="flex gap-2">
            <Button
              disabled={(!formData.connectionName || !formData.webSocketUrl) || isLoading}
              size="lg"
              type="submit"
              variant="default"
            >
              {isLoading ? 'Connecting...' : 'Add Connection'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}