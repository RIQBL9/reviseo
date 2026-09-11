import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  iconClassName,
  softClassName,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  iconClassName?: string;
  softClassName?: string;
}) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className={cn("flex size-10 items-center justify-center rounded-xl", softClassName ?? "bg-brand/10")}>
        <Icon className={cn("size-5", iconClassName ?? "text-brand")} strokeWidth={2.25} />
      </div>
      <p className="mt-2.5 text-xl font-extrabold text-ink">{value}</p>
      <p className="text-xs font-medium text-ink-muted">{label}</p>
    </div>
  );
}
