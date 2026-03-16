import type { ImuSectionProps } from './ImuDigitalView.types';

export function ImuSection({ title, children }: ImuSectionProps) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-1 border-b border-border">
        {title}
      </p>
      {children}
    </div>
  );
}
