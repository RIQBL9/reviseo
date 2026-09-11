import { Logo } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <Logo showTagline markSize={28} />
        <p className="text-sm text-ink-muted">
          &copy; {new Date().getFullYear()} Reviseo. Built for GCSE students.
        </p>
      </div>
    </footer>
  );
}
