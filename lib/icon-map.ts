import {
  Sigma,
  PenLine,
  BookOpen,
  Dna,
  FlaskConical,
  Atom,
  Microscope,
  Cpu,
  Globe2,
  Landmark,
  BookMarked,
  Briefcase,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

/** Maps the `icon` string stored per-subject in the database to a component. */
export const SUBJECT_ICON_MAP: Record<string, LucideIcon> = {
  Sigma,
  PenLine,
  BookOpen,
  Dna,
  FlaskConical,
  Atom,
  Microscope,
  Cpu,
  Globe2,
  Landmark,
  BookMarked,
  Briefcase,
  MessageCircle,
};

export function getSubjectIcon(icon: string): LucideIcon {
  return SUBJECT_ICON_MAP[icon] ?? BookOpen;
}
