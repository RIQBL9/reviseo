"use client";

import { useState, type ComponentPropsWithoutRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends ComponentPropsWithoutRef<"input"> {
  error?: string;
}

export function PasswordInput({ className, error, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={cn(
          "h-12 w-full rounded-2xl border border-border bg-surface px-4 pr-12 text-sm text-ink placeholder:text-ink-muted/70 transition-colors",
          "focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10",
          error && "border-danger focus:border-danger focus:ring-danger/10",
          className,
        )}
        aria-invalid={!!error}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-muted hover:text-ink"
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
      </button>
    </div>
  );
}
