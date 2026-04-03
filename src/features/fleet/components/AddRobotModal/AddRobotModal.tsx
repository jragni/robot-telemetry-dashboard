import { useCallback, useState } from 'react';
import { Plus, Loader2, AlertCircle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import * as ConnectionManager from '@/lib/rosbridge/ConnectionManager';
import { normalizeRosbridgeUrl } from '@/features/fleet/helpers';
import { addRobotSchema } from '@/features/fleet/schemas';
import type { AddRobotFormErrors } from './types/AddRobotModal.types';
import { FIELD_ERROR_IDS } from './constants';
import { FieldError } from './components/FieldError';
import { MobileHeader } from './components/MobileHeader';

/** AddRobotModal
 * @description Renders the add robot dialog with name and rosbridge URL inputs.
 *  Validates on submit with Zod, shows per-field errors that clear on type.
 *  Desktop: centered modal. Mobile: full-screen overlay with back arrow.
 */
export function AddRobotModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [errors, setErrors] = useState<AddRobotFormErrors>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const addRobot = useConnectionStore((s) => s.addRobot);
  const connectRobot = useConnectionStore((s) => s.connectRobot);

  const resetForm = useCallback(() => {
    setName('');
    setUrl('');
    setErrors({});
    setIsConnecting(false);
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) resetForm();
  }

  const hasNameError = errors.name != null;
  const hasUrlError = errors.url != null;
  const isSubmitDisabled = isConnecting || name.trim().length === 0 || url.trim().length === 0;

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validate with Zod
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

    // Normalize URL
    const normalizedUrl = normalizeRosbridgeUrl(validUrl);
    if (!normalizedUrl) {
      setErrors((prev) => ({ ...prev, url: 'Invalid URL — enter an IP, hostname, or WebSocket URL' }));
      return;
    }

    // Test connection
    setIsConnecting(true);
    setErrors((prev) => ({ ...prev, form: undefined }));

    try {
      await ConnectionManager.testConnection(normalizedUrl);
      const id = addRobot(validName, normalizedUrl);
      if (id === null) {
        setErrors((prev) => ({ ...prev, name: 'A robot with that name already exists' }));
        setIsConnecting(false);
        return;
      }
      await connectRobot(id);
      resetForm();
      setOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setErrors((prev) => ({ ...prev, form: message }));
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
      <DialogContent
        showCloseButton={false}
        className="bg-surface-primary border-border shadow-glow-top max-w-md rounded-sm
          max-sm:fixed max-sm:inset-0 max-sm:translate-x-0 max-sm:translate-y-0
          max-sm:top-0 max-sm:left-0 max-sm:max-w-none max-sm:w-full max-sm:h-full
          max-sm:rounded-none max-sm:border-0 max-sm:shadow-none max-sm:flex max-sm:flex-col
          sm:border"
      >
        <MobileHeader onClose={() => { setOpen(false); }} />

        <DialogHeader className="max-sm:hidden">
          <DialogTitle className="font-sans text-xl font-semibold text-text-primary">
            Add Robot
          </DialogTitle>
          <DialogDescription className="font-sans text-xs text-text-muted">
            Enter connection details for a new robot.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex flex-col gap-4 max-sm:flex-1 max-sm:px-4 max-sm:pt-6 sm:mt-2"
        >
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
              maxLength={50}
              disabled={isConnecting}
              aria-invalid={hasNameError}
              aria-describedby={hasNameError ? FIELD_ERROR_IDS.name : undefined}
              onChange={(e) => {
                setName(e.target.value);
                if (hasNameError) {
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              placeholder="e.g., Atlas-01"
              className={`font-sans text-sm text-text-primary bg-surface-tertiary placeholder:text-text-muted transition-colors duration-150 ${
                hasNameError ? 'border-status-critical' : 'border-border'
              }`}
            />
            <FieldError id={FIELD_ERROR_IDS.name} message={errors.name} />
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
              inputMode="url"
              value={url}
              disabled={isConnecting}
              aria-invalid={hasUrlError}
              aria-describedby={hasUrlError ? FIELD_ERROR_IDS.url : undefined}
              onChange={(e) => {
                setUrl(e.target.value);
                if (hasUrlError) {
                  setErrors((prev) => ({ ...prev, url: undefined }));
                }
              }}
              placeholder="e.g., 192.168.1.100 or wss://robot.example.com"
              className={`font-mono text-sm text-text-primary bg-surface-tertiary placeholder:text-text-muted transition-colors duration-150 ${
                hasUrlError ? 'border-status-critical' : 'border-border'
              }`}
            />
            <FieldError id={FIELD_ERROR_IDS.url} message={errors.url} />
          </div>

          {!!errors.form && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-sm border border-status-critical/30 bg-status-critical/10 px-3 py-2"
              >
                <AlertCircle size={14} className="text-status-critical shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <p className="font-mono text-xs text-status-critical">{errors.form}</p>
                  <p className="font-sans text-xs text-text-muted">
                    Check the URL and ensure the robot is powered on.
                  </p>
                </div>
              </div>
          )}

          <div className="max-sm:mt-auto max-sm:pb-6 sm:mt-2">
            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full uppercase tracking-wide cursor-pointer"
            >
              {isConnecting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Connecting...
                </>
              ) : (
                'Add Robot'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
