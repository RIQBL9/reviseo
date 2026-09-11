import { Flame } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function GreetingHeader({ displayName, streak }: { displayName: string; streak: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        {getGreeting()}, {displayName.split(" ")[0]} 👋
      </h1>
      {streak > 0 && (
        <div className="flex items-center gap-1.5 rounded-pill bg-flame-soft px-3.5 py-2 text-sm font-bold text-flame">
          <Flame className="size-4.5" fill="currentColor" />
          {streak} day streak
        </div>
      )}
    </div>
  );
}
