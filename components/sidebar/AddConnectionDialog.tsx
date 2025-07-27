"use client";

import { useState } from 'react';
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ConnectionDialogFormData { 
  connectionName: string,
  webSocketUrl: string
}

/**
 * AddConnectionDialog
 * 
 * @description
 * Dialog that adds a data source to the dashboard
 */
export default function AddConnectionDialog(): React.ReactNode {
  const [formData, setFormData] = useState<ConnectionDialogFormData>({
    connectionName: '',
    webSocketUrl: '',
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 mr-2 w-4" />
          <span>Add Data Source</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Data Source to Dashboard</DialogTitle>
        </DialogHeader>
        <div>
          <Label htmlFor="connection-name-input">Data Source Name:</Label>
          <Input
            id="connection-name-input"
            className="my-2"
            onChange={(e) => setFormData((prev) => ({...prev, connectonName: e.target.value }))}
            placeholder="Robot 1"
            value={formData.connectionName}
          />
        </div>
        <div>
          <Label htmlFor="websocket-url-input">WebSocket URL:</Label>
          <Input
            id="websocket-url-input"
            className="my-2"
            onChange={(e) => setFormData((prev) => ({...prev, webSocketUrl: e.target.value }))}
            placeholder="ws://192.168.1.100:9090 or https://random.ngrok.io:9090"
            value={formData.webSocketUrl}
          />
        </div>
        
      </DialogContent>
    </Dialog>
  );
}