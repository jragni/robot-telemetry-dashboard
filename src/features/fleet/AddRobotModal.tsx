import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useConnectionStore } from '../../shared/stores/connection/useConnectionStore';
import { normalizeRosbridgeUrl } from './fleet.helpers';

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
        <button
          type="button"
          className="flex items-center gap-2 font-mono text-xs font-semibold text-accent bg-transparent border border-accent rounded-sm cursor-pointer whitespace-nowrap uppercase tracking-wide px-2.5 py-[7px] mx-2 my-2 transition-colors duration-200 hover:bg-accent-subtle focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          <Plus size={16} className="shrink-0" />
          <span>Add Robot</span>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-surface-primary border border-border rounded-sm shadow-[inset_0_1px_0_0_var(--color-surface-glow)] max-w-md">
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
            <input
              id="robot-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g., Atlas-01"
              className="font-sans text-sm text-text-primary bg-surface-tertiary border border-border rounded-sm px-3 py-2 placeholder:text-text-muted focus:outline-2 focus:outline-accent focus:outline-offset-0 transition-colors duration-200"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="robot-url"
              className="font-sans text-xs font-semibold text-text-secondary uppercase tracking-wide"
            >
              Rosbridge URL
            </label>
            <input
              id="robot-url"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              placeholder="e.g., 192.168.1.100:9090"
              className="font-mono text-sm text-text-primary bg-surface-tertiary border border-border rounded-sm px-3 py-2 placeholder:text-text-muted focus:outline-2 focus:outline-accent focus:outline-offset-0 transition-colors duration-200"
            />
          </div>
          {error && (
            <p className="font-mono text-xs text-status-critical">{error}</p>
          )}
          <button
            type="submit"
            className="font-sans text-sm font-semibold uppercase tracking-wide px-6 py-2.5 bg-accent text-surface-base border-none rounded-sm cursor-pointer transition-all duration-200 hover:shadow-[0_0_20px_var(--color-accent-glow)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 mt-2"
          >
            Add Robot
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
