import { Badge } from "@/components/ui/Badge";
import { MASTERY_LABELS } from "@/lib/mastery";
import type { MasteryLevel } from "@/lib/types/database";

const VARIANT_BY_LEVEL: Record<MasteryLevel, "neutral" | "danger" | "warning" | "brand" | "success"> = {
  not_started: "neutral",
  learning: "danger",
  improving: "warning",
  confident: "brand",
  mastered: "success",
};

export function MasteryBadge({ level }: { level: MasteryLevel }) {
  return <Badge variant={VARIANT_BY_LEVEL[level]}>{MASTERY_LABELS[level]}</Badge>;
}
