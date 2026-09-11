import { type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const VARIANT_CLASSES = {
  neutral: "bg-surface-muted text-ink-muted",
  brand: "bg-brand/10 text-brand-dark",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  flame: "bg-flame-soft text-flame",
  xp: "bg-xp-soft text-amber-600",
} as const;

interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  variant?: keyof typeof VARIANT_CLASSES;
}

export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-semibold",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}
