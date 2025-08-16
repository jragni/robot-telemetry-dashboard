'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import ComboBox from '@/components/combobox';
import { getOptionsFromSubs } from './helpers';
import { RobotConnection } from '../dashboard/definitions';

interface AddControlModalProps {
  isDialogOpen: boolean
  selectedConnection: RobotConnection | null
  setIsDialogOpen: (isDialogOpen: boolean) => void
}

export default function AddControlModal({
  isDialogOpen,
  selectedConnection,
  setIsDialogOpen,
}: AddControlModalProps) {
  const [isTopicComboBoxOpen, setIsTopicComboBoxOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({ topic: '' });
  // TODO move out of this component
  const {
    subscriptions,
    status: connectionStatus,
  } = selectedConnection ?? { subscriptions: []};
  const topicOptions = getOptionsFromSubs(subscriptions);

  const handleUpdateForm = (field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const isAddControlButtonDisabled = !selectedConnection || connectionStatus !== 'connected';

  return (
    <Dialog
      onOpenChange={() => isAddControlButtonDisabled ? null : setIsDialogOpen(!isDialogOpen)}
      open={isDialogOpen}
    >
      <DialogTrigger
        asChild
        className="w-fit bg-orange-100"
        disabled={isAddControlButtonDisabled}
      >
        <div>
          <Button
            disabled={isAddControlButtonDisabled}
            variant="default"
          >
            <Plus />
            <Label>Add a Control</Label>
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Robot Control</DialogTitle>
          <DialogDescription>
            Send commands your robot by creating buttons that publish messages to selected topics
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label
            className="font-bold my-1"
            htmlFor="topic-combobox"
          >
            Topic
          </Label>
          <ComboBox
            id="topic-combobox"
            open={isTopicComboBoxOpen}
            options={topicOptions}
            setOpen={() => setIsTopicComboBoxOpen(!isTopicComboBoxOpen)}
            setValue={(val) => handleUpdateForm('topic', val)}
            value={formData.topic}
          />
        </div>
        <div>
          <p className="font-bold my-1" >Type</p>
          <p>
            {
              formData.topic
                ? subscriptions.filter(({ topicName }) => formData.topic === topicName)[0]
                  .messageType
                : 'N/A'
            }
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}