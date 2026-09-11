import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border bg-surface-muted/60 px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand/10">
        <Icon className="size-7 text-brand" strokeWidth={2} />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-ink">{title}</p>
        {description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
