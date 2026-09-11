import { Layers, Target, BarChart3, BookOpenCheck, Trophy, Users } from "lucide-react";
import { cn } from "@/lib/utils";

/** Literal class strings so Tailwind's static scanner can find them (no template interpolation). */
const THEME_CLASSES = {
  biology: "bg-biology-soft text-biology",
  physics: "bg-physics-soft text-physics",
  chemistry: "bg-chemistry-soft text-chemistry",
  maths: "bg-maths-soft text-maths",
  history: "bg-history-soft text-history",
  "computer-science": "bg-computer-science-soft text-computer-science",
} as const;

const FEATURES = [
  {
    icon: Layers,
    title: "Flashcards that stick",
    description: "Flip through topic decks, rate your confidence, and Reviseo brings back what you're shakiest on.",
    theme: "biology",
  },
  {
    icon: BookOpenCheck,
    title: "Quizzes on the real spec",
    description: "Multiple choice and short answer questions mapped to your exact exam board and topic list.",
    theme: "physics",
  },
  {
    icon: Target,
    title: "Daily goals",
    description: "A simple daily XP target keeps revision consistent without turning it into a chore.",
    theme: "chemistry",
  },
  {
    icon: BarChart3,
    title: "Mastery you can see",
    description: "Every topic tracks a live mastery score built from accuracy, practice and how recently you revised it.",
    theme: "maths",
  },
  {
    icon: Trophy,
    title: "XP, streaks & achievements",
    description: "Real revision earns real XP. Keep your streak alive and unlock achievements as you go.",
    theme: "history",
  },
  {
    icon: Users,
    title: "Revise with friends",
    description: "Add friends, compare progress and climb a leaderboard that's about your circle, not the world.",
    theme: "computer-science",
  },
] as const satisfies { icon: typeof Layers; title: string; description: string; theme: keyof typeof THEME_CLASSES }[];

export function FeatureGrid() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Everything you need to revise, nothing you don&apos;t
          </h2>
          <p className="mt-3 text-balance text-lg text-ink-muted">
            A focused revision toolkit that adapts to your subjects, your exam boards and how you're actually doing.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-card border border-border bg-surface p-6 transition-shadow hover:shadow-[0_20px_40px_-24px_rgba(30,27,58,0.25)]"
            >
              <div
                className={cn(
                  "flex size-12 items-center justify-center rounded-2xl",
                  THEME_CLASSES[feature.theme],
                )}
              >
                <feature.icon className="size-6" strokeWidth={2.25} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-ink">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
