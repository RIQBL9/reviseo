import Link from "next/link";
import { Layers, PenTool, ChevronRight } from "lucide-react";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { MasteryBadge } from "@/components/subjects/MasteryBadge";
import type { TopicNodeWithProgress } from "@/lib/data/subject-detail";

function LeafTopicRow({ topic, color }: { topic: TopicNodeWithProgress; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5">
      <ProgressRing value={topic.progress.masteryScore} size={40} strokeWidth={4} color={color} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink">{topic.name}</p>
        <MasteryBadge level={topic.progress.masteryLevel} />
      </div>
      <div className="flex shrink-0 gap-1.5">
        <Link
          href={`/revision/flashcards/${topic.id}`}
          className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-ink-muted hover:border-brand/40 hover:text-ink"
        >
          <Layers className="size-3.5" />
          Cards
        </Link>
        <Link
          href={`/practice/${topic.id}`}
          className="flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-white"
        >
          <PenTool className="size-3.5" />
          Practice
        </Link>
      </div>
    </div>
  );
}

export function TopicSection({ topic, color }: { topic: TopicNodeWithProgress; color: string }) {
  if (topic.isLeaf) {
    return <LeafTopicRow topic={topic} color={color} />;
  }

  return (
    <details className="group rounded-card border border-border bg-surface" open>
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
        <ProgressRing value={topic.progress.masteryScore} size={36} strokeWidth={4} color={color} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-ink">{topic.name}</p>
          <p className="text-xs text-ink-muted">{topic.children.length} subtopics</p>
        </div>
        <ChevronRight className="size-4.5 text-ink-muted transition-transform group-open:rotate-90" />
      </summary>
      <div className="space-y-2 border-t border-border p-3">
        {topic.children.map((child) => (
          <TopicSection key={child.id} topic={child} color={color} />
        ))}
      </div>
    </details>
  );
}
