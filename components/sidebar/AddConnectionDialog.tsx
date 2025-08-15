"use client";

import { ChangeEvent, useState } from 'react';
import { toast } from 'sonner';
import { Plus } from "lucide-react";
import { v4 as uuidV4 } from 'uuid';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  })

  const { addConnection, connections } = useConnection()

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
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const { reason, status } = validateAddConnectionForm(formData, connections)
      if (status === 'valid') {
        await addConnection(
          uuidV4(),
          formData.connectionName.trim(),
          formData.webSocketUrl.trim()
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
      toast.error('Unable to add data source. Please verify WebSocket URL is valid.')
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
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
        <div>
          <Label htmlFor="connection-name-input">Data Source Name:</Label>
          <Input
            id="connection-name-input"
            className="my-2"
            onChange={(e) => handleUpdateForm(e, 'connectionName')}
            placeholder="Robot 1"
            value={formData.connectionName}
          />
        </div>
        <div>
          <Label htmlFor="websocket-url-input">WebSocket URL:</Label>
          <Input
            id="websocket-url-input"
            className="my-2"
            onChange={(e) => handleUpdateForm(e, 'webSocketUrl')}
            placeholder="ws://192.168.1.100:9090 or https://random.ngrok.io:9090"
            value={formData.webSocketUrl}
          />
        </div>
        <div className="flex gap-2">
          <Button
            disabled={(!formData.connectionName || !formData.webSocketUrl) || isLoading}
            onClick={handleSubmit}
            size="lg"
            variant="default"
          >
            {isLoading ? 'Connecting...' : 'Add Connection'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}