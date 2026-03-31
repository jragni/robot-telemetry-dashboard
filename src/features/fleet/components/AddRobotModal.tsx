import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ConditionalRender } from '@/components/ConditionalRender';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { normalizeRosbridgeUrl } from '../helpers';

/** AddRobotModal
 * @description Renders the add robot dialog with name and rosbridge URL inputs.
 */
export function AddRobotModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const addRobot = useConnectionStore((s) => s.addRobot);
  const robots = useConnectionStore((s) => s.robots);

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Robot name is required');
      return;
    }
    const id = trimmedName.toLowerCase().replace(/\s+/g, '-');
    if (robots[id]) {
      setError('A robot with that name already exists');
      return;
    }
    const normalizedUrl = normalizeRosbridgeUrl(url);
    if (!normalizedUrl) {
      setError('Rosbridge URL is required');
      return;
    }
    addRobot(trimmedName, normalizedUrl);
    setName('');
    setUrl('');
    setError('');
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 font-mono text-xs font-semibold text-accent border-accent uppercase tracking-wide hover:bg-accent-subtle"
        >
          <Plus size={16} className="shrink-0" />
          Add Robot
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-surface-primary border border-border rounded-sm shadow-glow-top max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans text-xl font-semibold text-text-primary">
            Add Robot
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="robot-name"
              className="font-sans text-xs font-semibold text-text-secondary uppercase tracking-wide"
            >
              Robot Name
            </label>
            <Input
              id="robot-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g., Atlas-01"
              className="font-sans text-sm text-text-primary bg-surface-tertiary border-border placeholder:text-text-muted"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="robot-url"
              className="font-sans text-xs font-semibold text-text-secondary uppercase tracking-wide"
            >
              Rosbridge URL
            </label>
            <Input
              id="robot-url"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              placeholder="e.g., 192.168.1.100:9090"
              className="font-mono text-sm text-text-primary bg-surface-tertiary border-border placeholder:text-text-muted"
            />
          </div>
          <ConditionalRender
            shouldRender={!!error}
            Component={
              <p className="font-mono text-xs text-status-critical">{error}</p>
            }
          />
          <Button type="submit" className="mt-2 uppercase tracking-wide">
            Add Robot
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
