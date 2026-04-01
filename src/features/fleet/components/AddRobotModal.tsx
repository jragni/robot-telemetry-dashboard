import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
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
import * as ConnectionManager from '@/lib/rosbridge/ConnectionManager';
import { normalizeRosbridgeUrl } from '../helpers';
import { addRobotSchema } from '../schemas';

/** AddRobotModal
 * @description Renders the add robot dialog with name and rosbridge URL inputs.
 *  Validates with Zod, tests the connection before adding — only adds the
 *  robot if the rosbridge endpoint is reachable.
 */
export function AddRobotModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [errors, setErrors] = useState<{ name?: string; url?: string; form?: string }>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const addRobot = useConnectionStore((s) => s.addRobot);
  const connectRobot = useConnectionStore((s) => s.connectRobot);
  const robots = useConnectionStore((s) => s.robots);

  function clearErrors() {
    setErrors({});
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    // 1. Validate with Zod
    const result = addRobotSchema.safeParse({ name, url });
    if (!result.success) {
      const issues = result.error.issues;
      const nameIssue = issues.find((i) => i.path[0] === 'name');
      const urlIssue = issues.find((i) => i.path[0] === 'url');
      setErrors({
        name: nameIssue?.message,
        url: urlIssue?.message,
      });
      return;
    }

    const { name: validName, url: validUrl } = result.data;

    // 2. Check for duplicates
    const id = validName.toLowerCase().replace(/\s+/g, '-');
    if (robots[id]) {
      setErrors({ name: 'A robot with that name already exists' });
      return;
    }

    // 3. Normalize URL
    const normalizedUrl = normalizeRosbridgeUrl(validUrl);
    if (!normalizedUrl) {
      setErrors({ url: 'Invalid URL — enter an IP, hostname, or WebSocket URL' });
      return;
    }

    // 4. Test connection
    setIsConnecting(true);
    setErrors({});

    try {
      await ConnectionManager.testConnection(normalizedUrl);
      addRobot(validName, normalizedUrl);
      await connectRobot(id);
      setName('');
      setUrl('');
      setErrors({});
      setOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setErrors({ form: message });
    } finally {
      setIsConnecting(false);
    }
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
        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4 mt-4">
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
              disabled={isConnecting}
              onChange={(e) => {
                setName(e.target.value);
                clearErrors();
              }}
              placeholder="e.g., Atlas-01"
              className="font-sans text-sm text-text-primary bg-surface-tertiary border-border placeholder:text-text-muted"
            />
            <ConditionalRender
              shouldRender={!!errors.name}
              Component={
                <p className="font-mono text-xs text-status-critical">{errors.name}</p>
              }
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
              disabled={isConnecting}
              onChange={(e) => {
                setUrl(e.target.value);
                clearErrors();
              }}
              placeholder="e.g., 192.168.1.100 or wss://robot.example.com"
              className="font-mono text-sm text-text-primary bg-surface-tertiary border-border placeholder:text-text-muted"
            />
            <ConditionalRender
              shouldRender={!!errors.url}
              Component={
                <p className="font-mono text-xs text-status-critical">{errors.url}</p>
              }
            />
          </div>
          <ConditionalRender
            shouldRender={!!errors.form}
            Component={
              <p className="font-mono text-xs text-status-critical">{errors.form}</p>
            }
          />
          <Button type="submit" disabled={isConnecting} className="mt-2 uppercase tracking-wide">
            {isConnecting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Connecting...
              </>
            ) : (
              'Add Robot'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
