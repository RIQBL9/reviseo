import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMinutes(totalSeconds: number) {
  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining === 0 ? `${hours}h` : `${hours}h ${remaining}m`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const dateA = new Date(`${a}T00:00:00Z`).getTime();
  const dateB = new Date(`${b}T00:00:00Z`).getTime();
  return Math.round((dateB - dateA) / msPerDay);
}
