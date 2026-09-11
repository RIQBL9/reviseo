import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  size?: number;
}

/** The open-book + sunrise mark, recreated as scalable SVG. */
export function LogoMark({ className, size = 36 }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="reviseo-left" x1="6" y1="18" x2="32" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#4338CA" />
        </linearGradient>
        <linearGradient id="reviseo-right" x1="32" y1="18" x2="58" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22D3EE" />
          <stop offset="1" stopColor="#16A34A" />
        </linearGradient>
        <linearGradient id="reviseo-arrow" x1="24" y1="40" x2="46" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" />
          <stop offset="1" stopColor="#EF4444" />
        </linearGradient>
      </defs>

      <path
        d="M32 24C27 19 18 17 9 18.5C7.9 18.7 7 19.6 7 20.8V45C7 46.4 8.3 47.4 9.6 47.1C18 45.3 26.6 47.4 32 52V24Z"
        fill="url(#reviseo-left)"
      />
      <path
        d="M32 24C37 19 46 17 55 18.5C56.1 18.7 57 19.6 57 20.8V45C57 46.4 55.7 47.4 54.4 47.1C46 45.3 37.4 47.4 32 52V24Z"
        fill="url(#reviseo-right)"
      />

      <circle cx="32" cy="15" r="4.5" fill="#FBBF24" />
      <g stroke="#FBBF24" strokeWidth="2.2" strokeLinecap="round">
        <path d="M32 4.5V7.5" />
        <path d="M24 8L26 10.5" />
        <path d="M40 8L38 10.5" />
      </g>

      <path
        d="M25 34L36 22.5L36 28.5L43 21L46 24.5L37 33L43 33L31 45L33 36L25 36Z"
        fill="url(#reviseo-arrow)"
      />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  markSize?: number;
  showTagline?: boolean;
  wordmarkClassName?: string;
}

export function Logo({ className, markSize = 34, showTagline = false, wordmarkClassName }: LogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={markSize} />
      <div className="flex flex-col leading-none">
        <span className={cn("text-xl font-extrabold tracking-tight text-ink", wordmarkClassName)}>
          Revise<span className="text-physics">o</span>
        </span>
        {showTagline && (
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
            Revise today &middot; Brighter tomorrow
          </span>
        )}
      </div>
    </div>
  );
}
