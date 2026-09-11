import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconBadgeProps {
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: { wrap: "size-9 rounded-xl", icon: "size-4.5" },
  md: { wrap: "size-11 rounded-2xl", icon: "size-5.5" },
  lg: { wrap: "size-14 rounded-2xl", icon: "size-7" },
} as const;

export function IconBadge({ icon: Icon, className, iconClassName, size = "md" }: IconBadgeProps) {
  const s = SIZE_CLASSES[size];
  return (
    <div className={cn("flex shrink-0 items-center justify-center", s.wrap, className)}>
      <Icon className={cn(s.icon, iconClassName)} strokeWidth={2.25} />
    </div>
  );
}
